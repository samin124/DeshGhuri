export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background py-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm lg:flex-row lg:px-6">
        <p className="text-muted-foreground">
          Copyright {currentYear} DeshGhuri. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="/terms"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms
          </a>
          <a
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </a>
          <a href="/help" className="text-muted-foreground transition-colors hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
