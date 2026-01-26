type FileUploadProps = {
  label: string;
  helperText?: string;
};

export default function FileUpload({ label, helperText }: FileUploadProps) {
  return (
    <label className="block text-sm font-medium text-neutral-700">
      {label}
      <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-3">
        <span className="text-sm text-neutral-600">파일을 선택하세요</span>
        <input
          type="file"
          className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200"
        />
      </div>
      {helperText ? <p className="mt-1 text-xs text-neutral-500">{helperText}</p> : null}
    </label>
  );
}
