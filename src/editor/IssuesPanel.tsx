import type { GraphIssue } from "../core/graph/types"
import { type Locale, formatIssueLevel, getUiText, translateMessage } from "../i18n"

type IssuesPanelProps = {
  locale: Locale
  issues: GraphIssue[]
}

export function IssuesPanel({ locale, issues }: IssuesPanelProps) {
  const text = getUiText(locale)

  return (
    <section className="panel issues-panel">
      <div className="panel__header">
        <h2>{text.validatorTitle}</h2>
        <p>{issues.length === 0 ? text.validatorHealthy : text.validatorFound(issues.length)}</p>
      </div>
      <div className="issues-list">
        {issues.length === 0 ? (
          <div className="issue-card issue-card--info">{text.validatorHealthyDetail}</div>
        ) : (
          issues.map((issue, index) => (
            <article key={`${issue.nodeId ?? "graph"}-${index}`} className={`issue-card issue-card--${issue.level}`}>
              <span className="issue-card__level">{formatIssueLevel(locale, issue.level)}</span>
              <p>{translateMessage(locale, issue.message)}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
