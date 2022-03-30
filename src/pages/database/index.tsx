import ReactMarkdown from 'react-markdown'
import highlight from 'rehype-highlight'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import * as documentation from '@/doc'
import styles from './database.module.css'

export const Database = () => {
  return (
    <Main>
      <Row padding="xl" gap="xl" justify="center">
        <Column padding="xl" background="var(--eee)">
          {documentation.all.map(({ title, number }, index) => (
            <div key={index} className={styles.buttonItem}>
              {number} – {title}
            </div>
          ))}
        </Column>
        <div style={{ flex: 1, maxWidth: 1000, background: 'var(--eee)' }}>
          <div style={{ margin: 'var(--xl)' }}>
            {documentation.all.map(({ text }, index) => (
              <ReactMarkdown
                key={index}
                className="remark-render"
                rehypePlugins={[highlight]}
              >
                {text}
              </ReactMarkdown>
            ))}
          </div>
        </div>
      </Row>
    </Main>
  )
}
