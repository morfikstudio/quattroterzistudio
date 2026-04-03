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
          label="Lorem ipsum dolor"
          paragraphs={[
            "Vitae vel tellus nullam sit hendrerit amet eget turpis. Tortor adipiscing orci orci porta. Sed elementum eget dignissim in euismod faucibus non. Vitae vel tellus nullam sit hendrerit amet eget turpis. ",
            "Facilisi morbi leo aenean vitae sed posuere ut. Vestibulum turpis tellus lobortis diam. Auctor in urna lectus nec dictum blandit. Suspendisse ac sagittis.",
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
        <HoverList label="Imcommodo tellus" />
      </section>
    </>
  )
}
