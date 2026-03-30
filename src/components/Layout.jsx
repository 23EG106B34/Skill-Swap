import { Link, useLocation } from 'react-router-dom'
import { Handshake, Home, Lightbulb, LogIn, LogOut, Radar, Users, UserRoundCheck } from 'lucide-react'

const navItems = [
    { path: '/', label: 'Home', icon: Home, public: true },
    { path: '/marketplace', label: 'Marketplace', icon: Radar, public: true },
    { path: '/community', label: 'Community', icon: Users, public: true },
    { path: '/dashboard', label: 'Dashboard', icon: Handshake, auth: true },
    { path: '/skills', label: 'My Skills', icon: Lightbulb, auth: true },
    { path: '/requests', label: 'Requests', icon: UserRoundCheck, auth: true },
]

function Layout({ currentUser, onLogout, children }) {
    const location = useLocation()

    const filteredNavItems = navItems.filter((item) => {
        if (item.public && !item.auth) return true
        if (item.auth && currentUser) return true
        return false
    })

    return (
        <div className="app-shell">
            <div className="bg-orb orb-one" />
            <div className="bg-orb orb-two" />
            <div className="bg-grid" />

            <nav className="main-nav">
                <div className="nav-brand">
                    <Link to="/">
                        <h1>SkillSwap Nexus</h1>
                    </Link>
                </div>

                <div className="nav-links">
                    {filteredNavItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>

                <div className="nav-auth">
                    {currentUser ? (
                        <div className="user-menu">
                            <span className="user-name">{currentUser.fullName}</span>
                            <button className="ghost-btn" type="button" onClick={onLogout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" className="nav-link auth-link">
                            <LogIn size={18} />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </nav>

            <main className="content-wrap">
                {children}
            </main>
        </div>
    )
}

export default Layout