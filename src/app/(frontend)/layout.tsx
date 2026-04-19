import Header from "@/components/Header"
import BreakpointProvider from "@/components/BreakpointProvider"
import LenisProvider from "@/components/LenisProvider"
import TextCursor from "@/components/TextCursor"
import CurtainTransition from "@/components/CurtainTransition"
import TransitionLayout from "@/components/TransitionLayout"
import SplashMarquee from "@/components/SplashMarquee"
import {
  IubendaProvider,
  IubendaCookieSolutionBannerConfigInterface,
  i18nDictionaries,
} from "@mep-agency/next-iubenda"

const iubendaBannerConfig: IubendaCookieSolutionBannerConfigInterface = {
  siteId: 4502656, // Your site ID
  cookiePolicyId: 23047240, // Your cookie policy ID
  lang: "it",

  // See https://www.iubenda.com/en/help/1205-how-to-configure-your-cookie-solution-advanced-guide
}
export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <IubendaProvider bannerConfig={iubendaBannerConfig}>
      <LenisProvider>
        <Header />
        <TransitionLayout>{children}</TransitionLayout>
        <SplashMarquee
          title="Welcome to Quattroterzi Studio"
          ctaText="Click anywhere to enter"
        />
        <CurtainTransition />
        <TextCursor text="Click anywhere to enter" />
        <BreakpointProvider />
      </LenisProvider>
    </IubendaProvider>
  )
}
