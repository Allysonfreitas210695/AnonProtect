export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-500 dark:bg-[#020617]">
      <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
        {/* Deep dark mode mesh effect */}
        <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 dark:block" />
        <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent dark:block" />

        {/* Light mode soft gradient */}
        <div className="absolute inset-0 block bg-linear-to-br from-blue-50/50 via-white to-purple-50/50 dark:hidden" />
      </div>

      <main className="relative z-10">{children}</main>
    </div>
  )
}
