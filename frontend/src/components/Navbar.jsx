import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { apiFetchBlob, apiFetchJson, clearToken, getToken } from "../Api/Client.js";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = getToken();
    const [menuOpen, setMenuOpen] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const menuRef = useRef(null);

    useEffect(() => {
        if (!token) {
            setDisplayName("");
            return;
        }
        let ignore = false;
        let objectUrl = "";
        apiFetchJson("/api/me")
            .then((data) => {
                if (ignore) return;
                const nameParts = [
                    data?.firstName,
                    data?.middleName,
                    data?.lastName,
                ]
                    .filter(Boolean)
                    .join(" ");
                const name =
                    nameParts.trim() ||
                    data?.email?.split("@")[0] ||
                    "Account";
                setDisplayName(name);
                if (data?.profileImageUrl) {
                    apiFetchBlob(data.profileImageUrl)
                        .then((blob) => {
                            objectUrl = URL.createObjectURL(blob);
                            setProfileImageUrl(objectUrl);
                        })
                        .catch(() => setProfileImageUrl(""));
                } else {
                    setProfileImageUrl("");
                }
            })
            .catch(() => {
                if (!ignore) setDisplayName("Account");
            });
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            ignore = true;
        };
    }, [token]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        clearToken();
        navigate("/");
    }

    const initials = displayName
        ? displayName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0].toUpperCase())
              .join("")
        : "AC";

    return (
        <nav className="nav">
            <div className="nav-inner">
                <Link to={token ? "/dashboard" : "/"} className="nav-brand">
                    <span className="nav-brand-mark">ApplicationTracker</span>
                    <span className="nav-brand-copy">Track every opportunity with clarity.</span>
                </Link>

                <div className="nav-links">
                    {token ? (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/applications/new"
                                className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                            >
                                New
                            </NavLink>
                            <NavLink
                                to="/applications"
                                end
                                className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                            >
                                Applications
                            </NavLink>
                            <NavLink
                                to="/playground"
                                className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                            >
                                Playground
                            </NavLink>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                            >
                                Profile
                            </NavLink>
                        <div className="nav-dropdown" ref={menuRef}>
                            <button
                                className="nav-link nav-link--cta nav-link--avatar"
                                onClick={() => setMenuOpen((prev) => !prev)}
                                type="button"
                            >
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl}
                                        alt="Profile"
                                        className="avatar-image"
                                    />
                                ) : (
                                    <span className="avatar">{initials}</span>
                                )}
                            </button>
                            {menuOpen && (
                                <div className="nav-menu">
                                    <button
                                        className="nav-menu-item"
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/profile");
                                        }}
                                    >
                                        Manage Account
                                    </button>
                                    <button
                                        className="nav-menu-item danger"
                                        type="button"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/"
                                className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `nav-link nav-link--cta${isActive ? " nav-link--active" : ""}`
                                }
                            >
                                Login
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
