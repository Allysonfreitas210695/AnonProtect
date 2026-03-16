export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background selection:bg-primary/30 relative min-h-screen transition-colors duration-500">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden">
        {/* Deep dark mode mesh effect */}
        <div className="absolute inset-0 hidden dark:block">
          <div className="via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-900/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        {/* Light mode soft gradient */}
        <div className="via-background absolute inset-0 block bg-linear-to-br from-blue-50/80 to-purple-50/80 dark:hidden" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col">{children}</main>
    </div>
  )
}
