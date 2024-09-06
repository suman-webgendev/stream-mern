const NotificationBadge = ({ count, children }) => {
  return (
    <div className="relative m-1 inline-block">
      {children}
      {count > 0 && (
        <span className="absolute -right-1 -top-1 z-50 flex size-5 items-center justify-center rounded-full bg-red-600 text-sm text-white transition-all duration-200">
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;
