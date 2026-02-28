import Image from "next/image"
import { PortableTextComponents } from "next-sanity"
import { urlFor } from "@/sanity/lib/image"

export const components: PortableTextComponents = {
  types: {
    // for every type in the schema
    image: (
      props, // if it finds an image type
    ) =>
      props.value ? ( // and there's a value fot it
        <Image // then it renders an image component
          className="rounded-lg not-prose w-full h-auto"
          src={urlFor(props.value) // using the same url helper as for other images
            .width(600)
            .height(400)
            .quality(80)
            .auto("format")
            .url()}
          alt={props?.value?.alt || ""}
          width="600"
          height="400"
        />
      ) : null,
  },
}
