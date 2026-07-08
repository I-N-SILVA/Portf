export function Placeholder({
  eyebrow,
  title,
  note,
  phase,
}: {
  eyebrow: string;
  title: string;
  note: string;
  phase?: string;
}) {
  return (
    <main className="os-stage">
      <p className="os-eyebrow">{eyebrow}</p>
      <h1 className="os-title">{title}</h1>
      <p className="os-sub">{note}</p>
      <div className="os-tablewrap">
        <table className="os-table">
          <tbody>
            <tr>
              <td className="os-table-empty">
                {phase ? `Arriving in ${phase}.` : "Nothing here yet."}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
