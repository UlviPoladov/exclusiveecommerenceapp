type SectionHeadingProps = {
  label: string;
  title: string;
};

export default function SectionHeading({ label, title }: SectionHeadingProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-[#db4444]" />
        <p className="text-sm font-medium text-[#db4444]">{label}</p>
      </div>
      <h2 className="text-2xl font-semibold text-[#1a1a1a]">{title}</h2>
    </div>
  );
}

