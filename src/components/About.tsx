import HeroAbout from "@/components/HeroAbout"
import ScrollMarquee from "@/components/ui/ScrollMarquee"
import TextTwoCol from "@/components/TextTwoCol"
import HoverList from "@/components/HoverList"
import { cn } from "@/utils/classNames"

export default function About() {
  return (
    <>
      <HeroAbout />
      <section
        className={cn(
          "relative px-[12px] md:px-[24px] pt-[48px] md:py-[104px]",
          "max-w-[1280px] mx-auto",
        )}
      >
        <TextTwoCol
          label="the studio"
          paragraphs={[
            "Identity is built before a word is spoken. It lives in spaces, in the way things look before they're explained. Environments, details, finishes. Images that define what people see first. ",
            "We make those images. Light, then shadows.",
          ]}
        />
      </section>
      <section>
        <ScrollMarquee />
      </section>
      <section
        className={cn(
          "relative px-[12px] md:px-[24px] pt-[48px] pb-[64px] md:pt-[104px] md:mb-24",
          "max-w-[1280px] mx-auto",
        )}
      >
        <HoverList label="what we shape" />
      </section>
    </>
  )
}
