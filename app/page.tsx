import TextType from "@/components/reactbits/TextType";

export default function Home() {
  return (
    <TextType
      text={[
        "Hello there...",
        "I'm Jalal Bouri, a software engineer",
        "This website is a work in progress...",
        "Come back later please",
      ]}
      className="text-4xl font-bold"
      pauseDuration={1500}
      typingSpeed={100}
      loop={true}
    />
  );
}
