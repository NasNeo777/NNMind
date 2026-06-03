import type { GraphIssue } from "../core/graph/types"

type IssuesPanelProps = {
  issues: GraphIssue[]
}

export function IssuesPanel({ issues }: IssuesPanelProps) {
  return (
    <section className="panel issues-panel">
      <div className="panel__header">
        <h2>Validator</h2>
        <p>{issues.length === 0 ? "当前图没有发现问题。" : `共发现 ${issues.length} 条提示。`}</p>
      </div>
      <div className="issues-list">
        {issues.length === 0 ? (
          <div className="issue-card issue-card--info">Graph is healthy enough for the MVP export path.</div>
        ) : (
          issues.map((issue, index) => (
            <article key={`${issue.nodeId ?? "graph"}-${index}`} className={`issue-card issue-card--${issue.level}`}>
              <span className="issue-card__level">{issue.level}</span>
              <p>{issue.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
