export default function PermissionGate({ permissions, required, children }) {
    if (!permissions || !permissions.includes(required)) return null;
    return children;
}