type ExampleCardProps = {
  title: string;
  description: string;
};

export default function ExampleCard({
  title,
  description,
}: ExampleCardProps) {
  return (
    <section style={{ border: "1px solid #e5e7eb", padding: "1rem" }}>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
