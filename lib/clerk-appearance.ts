import type { Appearance } from "@clerk/types";

const clerkVariables = {
  colorPrimary: "#00b4e6",
  colorText: "#112a33",
  colorTextSecondary: "#5a7380",
  colorInputBackground: "#ffffff",
  colorInputText: "#112a33",
  borderRadius: "0.5rem",
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  fontFamilyButtons: "var(--font-inter), system-ui, sans-serif",
  spacingUnit: "0.9rem",
} as const;

/** Default Clerk provider + modals (user profile, etc.) */
export const clerkAppearance: Appearance = {
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    ...clerkVariables,
    colorBackground: "#ffffff",
  },
  elements: {
    modalBackdrop: "bg-black/55 backdrop-blur-sm",
    modalContent:
      "bg-white rounded-xl shadow-2xl border border-border overflow-hidden max-h-[min(90vh,720px)]",
    card: "bg-white shadow-none border-0",
    cardBox: "shadow-none",
    navbar: "bg-muted/40 border-b border-border",
    navbarButton: "text-foreground hover:bg-muted",
    navbarButtonIcon: "text-muted-foreground",
    pageScrollBox: "bg-white",
    page: "bg-white",
    profileSection: "bg-white",
    profileSectionTitle: "text-foreground font-semibold",
    profileSectionContent: "text-foreground",
    profileSectionPrimaryButton:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "h-10 border-border bg-white shadow-sm focus:ring-2 focus:ring-primary/25",
    formButtonPrimary:
      "h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
    footer: "hidden",
    footerPages: "hidden",
    footerAction: "hidden",
    identityPreview: "border border-border bg-muted/30",
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-primary",
    badge: "bg-muted text-foreground",
    scrollBox: "bg-white",
  },
};

/** Embedded sign-in / sign-up cards (transparent shell) */
export const clerkSignInAppearance: Appearance = {
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
  variables: {
    ...clerkVariables,
    colorBackground: "transparent",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "shadow-none border-0 bg-transparent p-0 gap-5 w-full",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    logoBox: "hidden",
    main: "gap-5",
    socialButtons: "gap-3",
    socialButtonsBlockButton:
      "h-11 border border-border bg-white hover:bg-muted/60 text-foreground font-medium shadow-sm",
    socialButtonsBlockButtonText: "font-medium",
    dividerRow: "my-1",
    dividerLine: "bg-border",
    dividerText: "text-xs text-muted-foreground uppercase tracking-wide",
    form: "gap-4",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "h-11 border-border bg-white shadow-sm focus:ring-2 focus:ring-primary/25",
    formButtonPrimary:
      "h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium",
    formButtonReset: "text-muted-foreground",
    footer: "hidden",
    footerPages: "hidden",
    footerAction: "hidden",
    identityPreview: "border border-border bg-muted/30",
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldInputShowPasswordButton: "text-muted-foreground",
    alert: "border-border",
    otpCodeFieldInput: "border-border",
  },
};
