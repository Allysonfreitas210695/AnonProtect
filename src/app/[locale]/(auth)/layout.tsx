export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative min-h-screen transition-colors duration-500">
      <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
        {/* Deep dark mode mesh effect */}
        <div className="bg-background absolute inset-0 hidden dark:block">
          <div className="via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        </div>

        {/* Light mode soft gradient */}
        <div className="via-background absolute inset-0 block bg-linear-to-br from-blue-50/50 to-purple-50/50 dark:hidden" />
      </div>

      <main className="relative z-10">{children}</main>
    </div>
  )
}
