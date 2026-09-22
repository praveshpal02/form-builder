"use client";

import * as LucideIcons from "lucide-react";

const iconSizeClasses = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
  "2xl": "h-7 w-7",
  "3xl": "h-8 w-8",
};

const iconStrokeWidth = {
  xs: 2.5,
  sm: 2.5,
  md: 2,
  lg: 2,
  xl: 1.5,
  "2xl": 1.5,
  "3xl": 1.5,
};

export function Icon({ name, size = "md", className = "", strokeWidth, "aria-label": ariaLabel, ...props }) {
  const lucideName = Icons[name] || name;
  const IconComponent = LucideIcons[lucideName];
  if (!IconComponent) {
    console.warn(`Icon "${name}" (resolved to "${lucideName}") not found in lucide-react`);
    return null;
  }

  const effectiveSize = iconSizeClasses[size] || iconSizeClasses.md;
  const effectiveStrokeWidth = strokeWidth ?? iconStrokeWidth[size];

  return (
    <IconComponent
      className={`${effectiveSize} ${className}`}
      strokeWidth={effectiveStrokeWidth}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      {...props}
    />
  );
}

export const Icons = {
  plus: "Plus",
  minus: "Minus",
  edit: "Pencil",
  trash: "Trash2",
  copy: "Copy",
  copyPlus: "CopyPlus",
  externalLink: "ExternalLink",
  eye: "Eye",
  eyeOff: "EyeOff",
  settings: "Settings",
  menu: "Menu",
  x: "X",
  chevronDown: "ChevronDown",
  chevronUp: "ChevronUp",
  chevronLeft: "ChevronLeft",
  chevronRight: "ChevronRight",
  moreHorizontal: "MoreHorizontal",
  search: "Search",
  loader: "Loader2",
  check: "Check",
  checkCircle: "CheckCircle2",
  alertTriangle: "AlertTriangle",
  alertCircle: "CircleAlert",
  info: "Info",
  mail: "Mail",
  lock: "Lock",
  user: "User",
  logOut: "LogOut",
  arrowLeft: "ArrowLeft",
  arrowRight: "ArrowRight",
  arrowUp: "ArrowUp",
  arrowDown: "ArrowDown",
  gripVertical: "GripVertical",
  messageSquare: "MessageSquare",
  inbox: "Inbox",
  send: "Send",
  save: "Save",
  folderOpen: "FolderOpen",
  file: "File",
  fileText: "FileText",
  calendar: "Calendar",
  clock: "Clock",
  star: "Star",
  type: "Type",
  alignLeft: "AlignLeft",
  list: "List",
  grid: "Grid",
  phone: "Phone",
  hash: "Hash",
  checkbox: "CheckSquare",
  radio: "Circle",
  dropdown: "ChevronDown",
  upload: "Upload",
  link: "Link",
  globe: "Globe",
  image: "Image",
  video: "Video",
  music: "Music",
  archive: "Archive",
  download: "Download",
  home: "Home",
  layout: "LayoutDashboard",
  users: "Users",
  bell: "Bell",
  shield: "Shield",
  refreshCw: "RefreshCw",
  rotateCcw: "RotateCcw",
  minimize: "Minimize",
  maximize: "Maximize2",
  copyCheck: "Check",
};

export default Icon;