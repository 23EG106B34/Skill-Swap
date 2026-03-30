import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Handshake, Lightbulb, Radar, Rocket, Users } from 'lucide-react'

const itemAnimation = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-20px' },
    transition: { duration: 0.45 },
}

const features = [
    {
        icon: Lightbulb,
        title: 'Share Your Skills',
        description: 'Publish what you can teach and help others learn new abilities.',
    },
    {
        icon: Radar,
        title: 'Discover Opportunities',
        description: 'Browse the marketplace to find skills you want to learn.',
    },
    {
        icon: Handshake,
        title: 'Swap & Collaborate',
        description: 'Connect with peers and exchange knowledge through skill swaps.',
    },
    {
        icon: Rocket,
        title: 'Grow Together',
        description: 'Build your network and accelerate your learning journey.',
    },
]

function HomePage({ currentUser }) {
    return (
        <div className="home-page">
            <motion.section className="hero" {...itemAnimation}>
                <p className="hero-kicker">Peer Learning Platform</p>
                <h1>SkillSwap Nexus</h1>
                <p className="hero-subtitle">
                    A structured collaboration network where members exchange real-world expertise through
                    verified, skill-for-skill sessions.
                </p>

                <div className="hero-toolbar">
                    {currentUser ? (
                        <>
                            <p className="signed-in">
                                Signed in as <strong>{currentUser.fullName}</strong>
                            </p>
                            <Link to="/dashboard" className="primary-btn">
                                Go to Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <p className="signed-in">Sign in or create an account to start exchanging skills.</p>
                            <Link to="/auth" className="primary-btn">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </motion.section>

            <motion.section className="features-section" {...itemAnimation}>
                <h2>How It Works</h2>
                <div className="features-grid">
                    {features.map(({ icon: Icon, title, description }, index) => (
                        <motion.article
                            key={title}
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className="feature-icon">
                                <Icon size={24} />
                            </div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </motion.article>
                    ))}
                </div>
            </motion.section>

            <motion.section className="cta-section" {...itemAnimation}>
                <h2>Ready to Start Learning?</h2>
                <p>Join our community of learners and teachers today.</p>
                {!currentUser && (
                    <Link to="/auth" className="primary-btn large">
                        Create Your Profile
                    </Link>
                )}
            </motion.section>
        </div>
    )
}

export default HomePage