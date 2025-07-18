// Centralized icon system for BCFK
// All SVG icons extracted from inline usage throughout the codebase

export const icons = {
  // ACTION ICONS
  plus: {
    viewBox: "0 0 20 20",
    path: "M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z",
    fill: "currentColor",
  },

  close: {
    viewBox: "0 0 20 20",
    path: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  userOff: {
    viewBox: "0 0 24 24",
    path: "M21 2a2.333 2.333 0 0 0 -1.7 0.7L16.4 5.6a1 1 0 0 1 -0.933 0.267L4 3 2.967 4.033a1 1 0 0 0 0.267 1.6L12 10 8 14H3.633a1 1 0 0 0 -0.9 0.567L2 16l4 2 2 4 1.433 -0.733A1 1 0 0 0 10 20.367V16L14 12l4.367 8.767a1 1 0 0 0 1.6 0.267L21 20 18.133 8.567A1 1 0 0 1 18.4 7.633L21.3 4.733A2.333 2.333 0 0 0 22 3 1 1 0 0 0 21 2",
    fill: "currentColor",
  },
  search: {
    viewBox: "0 0 24 24",
    path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },

  refresh: {
    viewBox: "0 0 24 24",
    path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },

  trash: {
    viewBox: "0 0 20 20",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>',
    fill: "currentColor",
  },
  // STATUS ICONS
  warning: {
    viewBox: "0 0 20 20",
    path: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z",
    fill: "currentColor",
    fillRule: "evenodd",
    clipRule: "evenodd",
  },

  success: {
    viewBox: "0 0 20 20",
    path: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
    fill: "currentColor",
    fillRule: "evenodd",
    clipRule: "evenodd",
  },

  error: {
    viewBox: "0 0 20 20",
    path: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z",
    fill: "currentColor",
    fillRule: "evenodd",
    clipRule: "evenodd",
  },

  // BUSINESS LOGIC ICONS
  pencil: {
    viewBox: "0 0 20 20",
    path: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z",
    fill: "currentColor",
    fillRule: "evenodd",
    clipRule: "evenodd",
  },

  lockClosed: {
    viewBox: "0 0 24 24",
    path: "M19.29 9.36h-0.77V6.54C18.52 2.93 15.59 0 11.98 0C8.37 0 5.44 2.93 5.44 6.54v2.82h-0.77c-0.79 0-1.43 0.64-1.43 1.43v11.78c0 0.79 0.64 1.43 1.43 1.43h14.62c0.79 0 1.43-0.64 1.43-1.43V10.79C20.71 10 20.08 9.36 19.29 9.36z M13.39 16.84v2.34c0 0.77-0.62 1.39-1.39 1.39s-1.39-0.62-1.39-1.39v-2.34c-0.52-0.41-0.86-1.05-0.86-1.76c0-1.24 1.01-2.24 2.24-2.24s2.24 1.01 2.24 2.24C14.24 15.79 13.91 16.43 13.39 16.84z M15.01 9.25H8.95V6.54c0-1.65 1.34-3 3-3s3 1.34 3 3V9.25z",
    fill: "currentColor",
  },

  doorOpen: {
    viewBox: "0 0 24 24",
    path: "M2.67 7.18c1.36-2.07 3.47-3.59 5.95-4.19c0.19-0.05 0.35-0.18 0.42-0.36c0.07-0.18 0.06-0.39-0.05-0.55C8.19 0.84 7.19 0 5.95 0C2.97 0 0.54 2.01 0.54 4.48c0 1.05 0.36 2.01 0.97 2.78c0.12 0.15 0.31 0.24 0.51 0.23C2.21 7.48 2.46 7.35 2.67 7.18z M18.87 0c-1.59 0-2.99 0.83-3.79 2.09c-0.1 0.17-0.12 0.37-0.05 0.56c0.07 0.18 0.23 0.32 0.43 0.36c2.48 0.58 4.61 2.1 5.98 4.16c0.11 0.16 0.29 0.27 0.49 0.27c0.2 0.01 0.38-0.08 0.5-0.24c0.58-0.75 0.93-1.7 0.93-2.72C23.36 2.01 20.92 0 18.87 0z M21.95 13.72c0-1.73-0.45-3.36-1.24-4.77c-1.46-2.62-4.07-4.51-7.15-4.98c-0.49-0.08-0.99-0.13-1.5-0.13c-0.53 0-1.05 0.05-1.57 0.14C7.43 4.48 4.84 6.37 3.4 9.01c-0.77 1.41-1.21 3.02-1.21 4.73c0 2.93 1.29 5.57 3.33 7.38l-0.83 1.17c-0.36 0.5-0.24 1.2 0.27 1.56c0.2 0.14 0.42 0.21 0.65 0.21c0.35 0 0.7-0.16 0.92-0.47l0.83-1.17c1.4 0.77 3.01 1.2 4.72 1.2c1.71 0 3.31-0.44 4.72-1.2l0.83 1.17c0.22 0.31 0.56 0.47 0.92 0.47c0.22 0 0.45-0.07 0.65-0.21c0.5-0.36 0.62-1.06 0.27-1.56l-0.83-1.17C20.65 19.29 21.95 16.65 21.95 13.72z M12.07 20.85c-3.93 0-7.12-3.19-7.12-7.12c0-1.22 0.31-2.37 0.86-3.38c1.04-1.91 2.93-3.29 5.17-3.64c0.36-0.06 0.72-0.09 1.1-0.09c0.35 0 0.7 0.03 1.04 0.08c2.25 0.33 4.17 1.71 5.22 3.63c0.55 1.01 0.87 2.17 0.87 3.4C19.19 17.66 16 20.85 12.07 20.85z M16.05 15.39l-2.71-1.68c-0.06-0.32-0.23-0.59-0.47-0.78l0.12-3.41c0.02-0.43-0.32-0.8-0.76-0.82c-0.43-0.02-0.8 0.32-0.82 0.76l-0.12 3.41c-0.34 0.24-0.56 0.63-0.56 1.07c0 0.73 0.59 1.31 1.31 1.31c0.21 0 0.4-0.05 0.57-0.14l2.61 1.61c0.13 0.08 0.27 0.12 0.41 0.12c0.26 0 0.52-0.13 0.67-0.37C16.6 16.09 16.47 15.61 16.05 15.39z",
    fill: "currentColor",
  },

  plane: {
    viewBox: "0 0 20 20",
    path: "M17.5 1.666a1.938 1.938 0 0 0 -1.416 0.584l-2.416 2.416a0.838 0.838 0 0 1 -0.777 0.222L3.334 2.5l-0.861 0.861a0.834 0.834 0 0 0 0.222 1.334L10 8.334 6.666 11.668H3.028a0.838 0.838 0 0 0 -0.75 0.473l-0.611 1.194L5 15l1.666 3.334 1.194 -0.611a0.838 0.838 0 0 0 0.473 -0.75v-3.639L11.666 10l3.639 7.306a0.834 0.834 0 0 0 1.334 0.222l0.861 -0.862 -2.389 -9.527a0.838 0.838 0 0 1 0.222 -0.779L17.75 3.944A1.938 1.938 0 0 0 18.334 2.5 0.834 0.834 0 0 0 17.5 1.666",
    fill: "currentColor",
  },
};

// Helper function to get icon data
export function getIcon(name) {
  return icons[name];
}

// Available icon names
export const iconNames = Object.keys(icons);