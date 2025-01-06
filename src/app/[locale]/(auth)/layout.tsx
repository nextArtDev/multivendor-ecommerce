const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-muted/90 via-muted/30 to-muted/10 min-h-screen  ">
      {children}
    </div>
  )
}

export default AuthLayout

// text: bg-clip-text bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-300 via-yellow-100 to-orange-900
