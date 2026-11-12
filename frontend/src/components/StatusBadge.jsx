import { linkStatus } from "../lib/utils";

const STATUS = {
  active: { label: "Active", className: "badge-active" },
  expiring: { label: "Expiring soon", className: "badge-expiring" },
  expired: { label: "Expired", className: "badge-expired" },
};

const StatusBadge = ({ link }) => {
  const status = linkStatus(link);
  return (
    <span className={`badge ${STATUS[status].className}`}>
      {STATUS[status].label}
    </span>
  );
};

export default StatusBadge;
