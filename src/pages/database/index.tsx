import ReactMarkdown from 'react-markdown'
import hglt from 'rehype-highlight'
import { NavLink, useParams } from 'react-router-dom'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import * as documentation from '@/doc'
import styles from './database.module.css'

const toURI = (str: string) => {
  return str.replace(/ /g, '-').replace(/\?/g, '').toLowerCase()
}

export const Database = () => {
  const params = useParams()
  const page = documentation.all.find(doc => toURI(doc.title) === params.id)
  return (
    <Main>
      <Row padding="xl" gap="xl" justify="center">
        <Column
          background="var(--eee)"
          height={`calc(100vh - 85px - 48px)`}
          width={200}
          style={{
            position: 'sticky',
            top: 85 + 24,
            overflow: 'hidden auto',
            textOverflow: 'ellipsis',
          }}
        >
          <Column background="var(--ddd)" padding="l">
            Table of Contents
          </Column>
          <Column padding="l">
            <Row style={{ paddingBottom: 'var(--s)' }}>Guides</Row>
            {documentation.guides.map(({ title }, index) => (
              <NavLink
                to={`/database/${toURI(title)}`}
                key={index}
                className={styles.buttonItem}
              >
                {title}
              </NavLink>
            ))}
          </Column>
          <Column padding="l">
            <Row style={{ paddingBottom: 'var(--s)' }}>Encyclopaedia</Row>
            {documentation.encyclopaedia.map(({ title }, index) => (
              <NavLink
                to={`/database/${toURI(title)}`}
                key={index}
                className={styles.buttonItem}
              >
                {title}
              </NavLink>
            ))}
          </Column>
        </Column>
        <div style={{ flex: 1, maxWidth: 800, background: 'var(--eee)' }}>
          <div style={{ margin: 'var(--xl)' }}>
            {params.id && page && (
              <ReactMarkdown className="remark-render" rehypePlugins={[hglt]}>
                {page.text}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </Row>
    </Main>
  )
}
