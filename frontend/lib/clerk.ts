export const clerkAppearance = {
  elements: {
    rootBox: "clerk-root w-full min-w-0",
    cardBox: "clerk-card-box w-full min-w-0 max-w-full shadow-none",
    card: "clerk-card-shell w-full max-w-full min-w-0 overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.94),rgba(10,10,12,0.98))] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)]",
    headerTitle: "type-display text-3xl tracking-[-0.05em] text-white",
    headerSubtitle: "mt-3 text-sm leading-relaxed text-white/60",
    socialButtonsBlockButton:
      "clerk-motion-button plexus-motion-button h-11 rounded-[10px] border border-white/12 bg-white/[0.03] text-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[2px] hover:border-white/22 hover:bg-white/[0.06]",
    socialButtonsBlockButtonText: "text-sm font-medium text-white/84",
    socialButtonsProviderIcon: "clerk-motion-icon",
    dividerLine: "bg-white/10",
    dividerText: "type-label text-[11px] tracking-[0.18em] text-white/36",
    formFieldLabel: "mb-2 type-label text-[11px] tracking-[0.18em] text-white/52",
    formFieldInput:
      "h-11 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 text-white shadow-none outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-white/18 focus:bg-white/[0.05] focus:ring-0",
    formFieldInputShowPasswordButton: "text-white/48 hover:text-white",
    formButtonPrimary:
      "clerk-motion-button plexus-motion-button h-11 w-full rounded-[10px] border border-white/90 bg-white text-sm font-medium tracking-[-0.01em] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[2px] hover:bg-white/92",
    footerActionText: "text-sm text-white/48",
    footerActionLink: "plexus-motion-link font-medium text-white hover:text-white/78",
    identityPreviewText: "text-sm text-white/78",
    identityPreviewEditButton:
      "plexus-motion-link text-sm font-medium text-white/58 hover:text-white",
    formResendCodeLink:
      "plexus-motion-link text-sm font-medium text-white hover:text-white/78",
    otpCodeFieldInput:
      "rounded-[12px] border border-white/10 bg-white/[0.03] text-white shadow-none",
    formFieldSuccessText: "text-sm text-[#9be3bf]",
    formFieldWarningText: "text-sm text-[#f6c177]",
    formFieldErrorText: "text-sm text-[#ff9b9b]",
    userProfileRootBox: "clerk-root w-full min-w-0",
    userProfileCardBox: "clerk-profile-card-box w-full min-w-0 max-w-full shadow-none",
    userProfileCard:
      "clerk-card-shell w-full max-w-full min-w-0 overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.94),rgba(10,10,12,0.98))] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.88)]",
    navbar: "clerk-profile-navbar w-full border-white/8 bg-transparent",
    navbarButton:
      "clerk-profile-navbar-button clerk-motion-button plexus-motion-button min-h-11 justify-start rounded-[12px] px-4 text-left text-white/64 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/[0.04] hover:text-white data-[active=true]:bg-white/[0.05] data-[active=true]:text-white",
    pageScrollBox: "clerk-page-scroll-box w-full min-w-0 rounded-[22px]",
    page: "clerk-profile-page w-full max-w-full min-w-0 gap-6",
    profileSectionTitleText: "type-label text-[11px] tracking-[0.18em] text-white/42",
    profileSectionPrimaryButton:
      "clerk-motion-button plexus-motion-button h-11 rounded-[10px] border border-white/90 bg-white px-4 text-sm font-medium tracking-[-0.01em] text-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[2px] hover:bg-white/92",
    profileSectionSecondaryButton:
      "clerk-motion-button plexus-motion-button h-11 rounded-[10px] border border-white/12 bg-white/[0.03] px-4 text-sm font-medium text-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[2px] hover:border-white/22 hover:bg-white/[0.06]",
  },
};

export const clerkUserButtonAppearance = {
  elements: {
    userButtonBox: "clerk-user-button-box inline-flex shrink-0 items-center justify-center",
    avatarBox:
      "size-10 rounded-[12px] ring-1 ring-white/10 shadow-[0_18px_38px_-24px_rgba(0,0,0,0.78)]",
    userButtonAvatarBox:
      "clerk-user-button-avatar-box inline-flex shrink-0 items-center justify-center",
    userButtonTrigger:
      "clerk-user-button-trigger clerk-motion-button plexus-motion-button inline-flex items-center justify-center rounded-[12px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0",
    userButtonPopoverCard:
      "rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,18,20,0.96),rgba(10,10,12,0.99))] shadow-[0_24px_80px_-40px_rgba(0,0,0,0.92)] backdrop-blur-xl",
    userPreviewMainIdentifier: "text-sm font-medium text-white",
    userPreviewSecondaryIdentifier: "text-xs text-white/48",
    userButtonPopoverActionButton:
      "clerk-motion-button plexus-motion-button rounded-[12px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/74 hover:bg-white/[0.05] hover:text-white",
    userButtonPopoverActionButtonText: "text-sm",
    userButtonPopoverFooter: "hidden",
  },
};
