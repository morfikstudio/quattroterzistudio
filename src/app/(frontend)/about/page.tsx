import HeroAbout from "@/components/HeroAbout"
import DoubleMarquee from "@/components/ui/DoubleMarquee"
import TextTwoCol from "@/components/ui/TextTwoCol"
import HoverList from "@/components/ui/HoverList"

export default function Page() {
  return (
    <main className="">
      <HeroAbout />
      <TextTwoCol
        label="Lorem ipsum dolor"
        paragraphs={[
          "Vitae vel tellus nullam sit hendrerit amet eget turpis. Tortor adipiscing orci orci porta. Sed elementum eget dignissim in euismod faucibus non. Vitae vel tellus nullam sit hendrerit amet eget turpis. ",
          "Facilisi morbi leo aenean vitae sed posuere ut. Vestibulum turpis tellus lobortis diam. Auctor in urna lectus nec dictum blandit. Suspendisse ac sagittis.",
        ]}
      />
      <DoubleMarquee />
      <HoverList label="Imcommodo tellus" />
    </main>
  )
}
