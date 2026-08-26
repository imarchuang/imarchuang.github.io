type PanelName = "section" | "toc";
type PanelMode = "desktop" | "mobile";

const storageKey = (name: PanelName) => `article-reading:${name}:open`;

function readStored(name: PanelName): boolean {
  try {
    return window.localStorage.getItem(storageKey(name)) === "true";
  } catch {
    return false;
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
  let activeDesktop: PanelName | null = null;
  let activeDialog: PanelName | null = null;
  let pendingDialogFocus: { name: PanelName; mode: PanelMode | null; restore: boolean } | null = null;
  const backdrop = root.querySelector<HTMLButtonElement>("[data-reading-backdrop]");
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const triggers = (name: PanelName, mode: PanelMode) =>
    [
      ...root.querySelectorAll<HTMLButtonElement>(
        `[data-reading-open="${name}"][data-reading-mode="${mode}"]`,
      ),
    ];

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

  const setExpanded = (name: PanelName, mode: PanelMode, open: boolean): void => {
    triggers(name, mode).forEach((button) => button.setAttribute("aria-expanded", String(open)));
  };

  const closeDesktop = (
    name: PanelName,
    options: { restoreFocus?: boolean; focusMode?: PanelMode | null } = {},
  ): void => {
    const { restoreFocus = true, focusMode = "desktop" } = options;
    const panel = root.querySelector<HTMLElement>(`[data-reading-panel="${name}"]`);
    if (panel) {
      panel.hidden = true;
    }
    setExpanded(name, "desktop", false);
    writeStored(name, false);
    if (activeDesktop === name) {
      activeDesktop = null;
    }
    if (backdrop) {
      backdrop.hidden = activeDesktop === null;
    }
    if (restoreFocus) {
      focusTrigger(name, focusMode);
    }
  };

  const openDesktop = (name: PanelName): void => {
    if (activeDesktop && activeDesktop !== name) {
      closeDesktop(activeDesktop, { restoreFocus: false });
    }
    if (activeDialog && activeDialog !== name) {
      closeDialog(activeDialog, { restoreFocus: false });
    }
    const panel = root.querySelector<HTMLElement>(`[data-reading-panel="${name}"]`);
    if (!panel) {
      return;
    }
    activeDesktop = name;
    panel.hidden = false;
    if (backdrop) {
      backdrop.hidden = false;
    }
    setExpanded(name, "desktop", true);
    writeStored(name, true);
    panel.querySelector<HTMLElement>("button, a")?.focus();
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
    if (activeDesktop) {
      closeDesktop(activeDesktop, { restoreFocus: false });
    }
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
  };

  root.querySelectorAll<HTMLButtonElement>("[data-reading-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const name = trigger.dataset.readingOpen as PanelName;
      const mode = trigger.dataset.readingMode as PanelMode;
      if (mode === "mobile") {
        openDialog(name);
        return;
      }
      if (activeDesktop === name) {
        closeDesktop(name);
      } else {
        openDesktop(name);
      }
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-reading-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.readingClose as PanelName;
      const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
      if (dialog?.open) {
        closeDialog(name);
      } else {
        closeDesktop(name);
      }
    });
  });

  backdrop?.addEventListener("click", () => {
    if (activeDesktop) {
      closeDesktop(activeDesktop);
    }
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeDesktop) {
      closeDesktop(activeDesktop);
    }
  });

  root.addEventListener("click", (event) => {
    const link = (event.target as Element).closest("a");
    if (!link) {
      return;
    }
    (["section", "toc"] as PanelName[]).forEach((name) => {
      writeStored(name, false);
      const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
      if (dialog?.open) {
        closeDialog(name, { restoreFocus: false, focusMode: null });
      }
    });
    if (activeDesktop) {
      closeDesktop(activeDesktop, { restoreFocus: false, focusMode: null });
    }
  });

  const syncMode = (): void => {
    const nextMode: PanelMode = mobileQuery.matches ? "mobile" : "desktop";
    if (activeDialog) {
      closeDialog(activeDialog, { focusMode: nextMode });
    }
    if (activeDesktop) {
      closeDesktop(activeDesktop, { focusMode: nextMode });
    }
  };

  mobileQuery.addEventListener("change", syncMode);

  (["section", "toc"] as PanelName[]).forEach((name) => {
    const trigger = triggers(name, "desktop")[0];
    if (trigger && !mobileQuery.matches && readStored(name)) {
      openDesktop(name);
    }
  });
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
