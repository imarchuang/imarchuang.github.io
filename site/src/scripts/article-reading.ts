type PanelName = "section" | "toc";
type PanelMode = "desktop" | "mobile";

const storageKey = (name: PanelName) => `article-reading:v2:${name}:open`;

function readStored(name: PanelName): boolean | null {
  try {
    const value = window.localStorage.getItem(storageKey(name));
    return value === null ? null : value === "true";
  } catch {
    return null;
  }
}

function writeStored(name: PanelName, open: boolean): void {
  try {
    window.localStorage.setItem(storageKey(name), String(open));
  } catch {
    // Storage is an optional enhancement.
  }
}

function initializeReadingRoot(root: HTMLElement): void {
  let activeDialog: PanelName | null = null;
  let pendingDialogFocus: { name: PanelName; mode: PanelMode | null; restore: boolean } | null = null;
  let lastFocusedPanel: PanelName | null = null;
  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const storedState: Record<PanelName, boolean | null> = {
    section: readStored("section"),
    toc: readStored("toc"),
  };

  const triggers = (name: PanelName, mode: PanelMode) =>
    [
      ...root.querySelectorAll<HTMLButtonElement>(
        `[data-reading-open="${name}"][data-reading-mode="${mode}"]`,
      ),
    ];

  const desktopClose = (name: PanelName) =>
    root.querySelector<HTMLButtonElement>(
      `[data-reading-close="${name}"][data-reading-mode="desktop"]`,
    );

  const isVisible = (button: HTMLButtonElement): boolean =>
    button.isConnected &&
    button.getClientRects().length > 0 &&
    getComputedStyle(button).visibility !== "hidden";

  const focusTrigger = (name: PanelName, preferredMode: PanelMode | null = null): void => {
    const preferred = preferredMode ? triggers(name, preferredMode) : [];
    const fallback =
      preferredMode === "desktop" ? triggers(name, "mobile") : triggers(name, "desktop");
    const target = [...preferred, ...fallback].find((button) => isVisible(button));
    target?.focus();
  };

  const panelNameFor = (target: EventTarget | null): PanelName | null => {
    if (!(target instanceof Element)) {
      return null;
    }
    const container = target.closest<HTMLElement>(
      "[data-reading-open], [data-reading-close], [data-reading-panel], [data-reading-rail], [data-reading-dialog]",
    );
    const name =
      container?.dataset.readingOpen ??
      container?.dataset.readingClose ??
      container?.dataset.readingPanel ??
      container?.dataset.readingRail ??
      container?.dataset.readingDialog;
    return name === "section" || name === "toc" ? name : null;
  };

  root.addEventListener("focusin", (event) => {
    lastFocusedPanel = panelNameFor(event.target);
  });

  const setExpanded = (name: PanelName, mode: PanelMode, open: boolean): void => {
    triggers(name, mode).forEach((button) => button.setAttribute("aria-expanded", String(open)));
  };

  const revealCurrentSection = (container: HTMLElement): void => {
    const current = container.querySelector<HTMLElement>('[aria-current="page"]');
    if (!current) {
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const currentRect = current.getBoundingClientRect();
        const visibleTop = Math.max(containerRect.top, 0);
        const visibleBottom = Math.min(containerRect.bottom, window.innerHeight);
        const visibleHeight = Math.max(1, visibleBottom - visibleTop);
        const currentCenter =
          container.scrollTop + currentRect.top - containerRect.top + currentRect.height / 2;
        const desiredCenter = visibleTop - containerRect.top + visibleHeight / 2;
        container.scrollTop = Math.max(0, currentCenter - desiredCenter);
      });
    });
  };

  const defaultDesktopState = (name: PanelName): boolean =>
    name === "section" ? window.innerWidth >= 1100 : window.innerWidth >= 1400;

  const setDesktop = (
    name: PanelName,
    open: boolean,
    options: { persist?: boolean; moveFocus?: boolean } = {},
  ): void => {
    const { persist = false, moveFocus = false } = options;
    const panel = root.querySelector<HTMLElement>(`[data-reading-panel="${name}"]`);
    const rail = root.querySelector<HTMLElement>(`[data-reading-rail="${name}"]`);
    if (!panel || !rail) {
      return;
    }

    panel.hidden = !open;
    rail.hidden = open;
    root.setAttribute(`data-${name}-open`, String(open));
    setExpanded(name, "desktop", open);
    desktopClose(name)?.setAttribute("aria-expanded", String(open));
    if (name === "section" && open) {
      revealCurrentSection(panel);
      void document.fonts.ready.then(() => {
        if (root.getAttribute("data-section-open") === "true") {
          revealCurrentSection(panel);
        }
      });
    }

    if (persist) {
      storedState[name] = open;
      writeStored(name, open);
    }

    if (!moveFocus) {
      return;
    }
    if (open) {
      desktopClose(name)?.focus();
    } else {
      focusTrigger(name, "desktop");
    }
  };

  const closeDialog = (
    name: PanelName,
    options: { restoreFocus?: boolean; focusMode?: PanelMode | null } = {},
  ): void => {
    const { restoreFocus = true, focusMode = "mobile" } = options;
    const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
    pendingDialogFocus = { name, mode: focusMode, restore: restoreFocus };
    if (activeDialog === name) {
      activeDialog = null;
    }
    setExpanded(name, "mobile", false);
    if (dialog?.open) {
      dialog.close();
      return;
    }
    if (restoreFocus) {
      focusTrigger(name, focusMode);
    }
  };

  const openDialog = (name: PanelName): void => {
    if (activeDialog && activeDialog !== name) {
      closeDialog(activeDialog, { restoreFocus: false });
    }
    const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
    if (!dialog) {
      return;
    }
    activeDialog = name;
    dialog.showModal();
    setExpanded(name, "mobile", true);
    if (name === "section") {
      revealCurrentSection(dialog);
      void document.fonts.ready.then(() => {
        if (dialog.open) {
          revealCurrentSection(dialog);
        }
      });
    }
  };

  root.querySelectorAll<HTMLButtonElement>("[data-reading-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const name = trigger.dataset.readingOpen as PanelName;
      const mode = trigger.dataset.readingMode as PanelMode;
      if (mode === "mobile") {
        openDialog(name);
        return;
      }
      setDesktop(name, true, { persist: true, moveFocus: true });
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-reading-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.readingClose as PanelName;
      if (button.dataset.readingMode === "desktop") {
        setDesktop(name, false, { persist: true, moveFocus: true });
        return;
      }
      const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
      if (dialog?.open) {
        closeDialog(name);
      }
    });
  });

  root.querySelectorAll<HTMLDialogElement>("[data-reading-dialog]").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog && event instanceof MouseEvent) {
        const rect = dialog.getBoundingClientRect();
        const clickedInsideSheet =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        if (!clickedInsideSheet) {
          closeDialog(dialog.dataset.readingDialog as PanelName);
        }
      }
    });
    dialog.addEventListener("close", () => {
      const name = dialog.dataset.readingDialog as PanelName;
      setExpanded(name, "mobile", false);
      if (activeDialog === name) {
        activeDialog = null;
      }
      const pending =
        pendingDialogFocus?.name === name
          ? pendingDialogFocus
          : ({ name, mode: "mobile", restore: true } as const);
      pendingDialogFocus = null;
      if (pending.restore) {
        focusTrigger(name, pending.mode);
      }
    });
  });

  root.addEventListener("click", (event) => {
    const link = (event.target as Element).closest("a");
    const dialog = link?.closest("[data-reading-dialog]");
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) {
      return;
    }
    closeDialog(dialog.dataset.readingDialog as PanelName, {
      restoreFocus: false,
      focusMode: null,
    });
  });

  const syncLayout = (): void => {
    const nextMode: PanelMode = mobileQuery.matches ? "mobile" : "desktop";
    const closingDialog = activeDialog;
    if (closingDialog) {
      closeDialog(closingDialog, { restoreFocus: false, focusMode: null });
    }
    if (mobileQuery.matches) {
      const name =
        panelNameFor(document.activeElement) ??
        (document.activeElement === document.body ? lastFocusedPanel : null);
      if (name === "section" || name === "toc") {
        focusTrigger(name, "mobile");
      }
      return;
    }
    (["section", "toc"] as PanelName[]).forEach((name) => {
      const open = storedState[name] ?? defaultDesktopState(name);
      const panel = root.querySelector<HTMLElement>(`[data-reading-panel="${name}"]`);
      const focusWillHide = !open && panel?.contains(document.activeElement);
      setDesktop(name, open);
      if (focusWillHide) {
        focusTrigger(name, "desktop");
      }
    });
    if (closingDialog) {
      const open = root.getAttribute(`data-${closingDialog}-open`) === "true";
      if (open) {
        desktopClose(closingDialog)?.focus();
      } else {
        focusTrigger(closingDialog, nextMode);
      }
    }
  };

  let resizeQueued = false;
  window.addEventListener(
    "resize",
    () => {
      if (!resizeQueued) {
        resizeQueued = true;
        requestAnimationFrame(() => {
          syncLayout();
          resizeQueued = false;
        });
      }
    },
    { passive: true },
  );

  if (!mobileQuery.matches) {
    (["section", "toc"] as PanelName[]).forEach((name) => {
      setDesktop(name, storedState[name] ?? defaultDesktopState(name));
    });
  }
  root.dataset.readingReady = "true";
}

function initializeProgress(root: HTMLElement): void {
  const bar = root.querySelector<HTMLElement>("[data-reading-progress]");
  const article = root.querySelector<HTMLElement>("[data-article-column]");
  if (!bar || !article) {
    return;
  }
  let queued = false;
  let articleTop = 0;
  let articleHeight = 0;
  const measure = () => {
    articleTop = article.getBoundingClientRect().top + window.scrollY;
    articleHeight = article.offsetHeight;
  };
  const update = () => {
    const distance = Math.max(articleHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, (window.scrollY - articleTop) / distance));
    bar.style.setProperty("--reading-progress", String(progress));
    queued = false;
  };
  const requestUpdate = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  const refresh = () => {
    measure();
    requestUpdate();
  };
  window.addEventListener(
    "scroll",
    requestUpdate,
    { passive: true },
  );
  window.addEventListener("resize", refresh, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(refresh).observe(article);
  }
  measure();
  update();
}

function initializeActiveHeading(root: HTMLElement): void {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('.article-toc-list a[href^="#"]')];
  const headings = [
    ...new Set(
      links
        .map((link) => {
          const id = decodeURIComponent(link.hash.slice(1));
          return document.getElementById(id);
        })
        .filter((heading): heading is HTMLElement => heading instanceof HTMLElement),
    ),
  ];
  if (!headings.length) {
    return;
  }

  const markCurrent = (id: string) => {
    links.forEach((link) => {
      const current = decodeURIComponent(link.hash.slice(1)) === id;
      if (current) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };
  let queued = false;
  const update = () => {
    const threshold = window.innerHeight * 0.3;
    const current = headings.reduce(
      (selected, heading) => (heading.getBoundingClientRect().top <= threshold ? heading : selected),
      headings[0],
    );
    markCurrent(current.id);
    queued = false;
  };
  const requestUpdate = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("hashchange", requestUpdate);
  update();
}

document.querySelectorAll<HTMLElement>("[data-reading-root]").forEach((root) => {
  initializeReadingRoot(root);
  initializeProgress(root);
  initializeActiveHeading(root);
});
