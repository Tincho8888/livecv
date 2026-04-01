import { signOut } from "../../services/cvService";

export default function UserMenu({ session, onGoToDashboard, onClose }) {
  return (
    <div className="user-menu">
      <div className="user-menu-header">
        <div className="user-menu-name">
          {session.user.user_metadata?.full_name || "Usuario"}
        </div>
        <div className="user-menu-email">{session.user.email}</div>
      </div>
      <div className="user-menu-item" onClick={() => { onClose(); onGoToDashboard(); }}>
        ◈ Mis CVs
      </div>
      <div className="user-menu-item danger" onClick={signOut}>
        → Cerrar sesión
      </div>
    </div>
  );
}
