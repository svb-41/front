import { Fragment, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import hglt from 'rehype-highlight'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle, Caption } from '@/components/title'
import * as documentation from '@/doc'
import styles from './database.module.css'

const toURI = (str: string) => {
  return str.replace(/ /g, '-').replace(/\?/g, '').toLowerCase()
}

type Toc = { level: number; title: string }[] | null

const renderNav = (title: string, toc: Toc) => {
  return ({ isActive }: { isActive: boolean }) => (
    <Fragment>
      <div>{title}</div>
      {isActive && toc && (
        <Column gap="xs" className={styles.toc}>
          {toc.map((val, index) => {
            if (val.title === title) return null
            const dashed = new Array(val.level - 1).fill(0)
            return (
              <Row gap="m" key={index}>
                {dashed.map((_, index) => (
                  <div key={index} className={styles.dash} />
                ))}
                {val.title}
              </Row>
            )
          })}
        </Column>
      )}
    </Fragment>
  )
}

export const Database = () => {
  const params = useParams()
  const page = documentation.all.find(doc => toURI(doc.title) === params.id)
  const toc = useMemo<Toc>(() => {
    if (params.id && page) {
      const matches = page.text.match(/^#{1,6} .*$/gm)
      const titles = matches?.map(match => {
        const [level, ...title] = match.split(' ')
        return { level: level.length, title: title.join(' ') }
      })
      return titles ?? null
    }
    return null
  }, [params.id, page])
  return (
    <Main>
      <Row padding="xl" gap="xl" justify="center">
        <Column
          background="var(--eee)"
          height={`calc(100vh - 85px - 48px)`}
          width={200}
          className={styles.tocColumn}
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
                children={renderNav(title, toc)}
              />
            ))}
          </Column>
          <Column padding="l">
            <Row style={{ paddingBottom: 'var(--s)' }}>Encyclopaedia</Row>
            {documentation.encyclopaedia.map(({ title }, index) => (
              <NavLink
                to={`/database/${toURI(title)}`}
                key={index}
                className={styles.buttonItem}
                children={renderNav(title, toc)}
              />
            ))}
          </Column>
        </Column>
        <div
          style={{
            flex: 1,
            maxWidth: 800,
            background: 'var(--eee)',
            display: page ? undefined : 'flex',
          }}
        >
          <div
            style={{
              margin: 'var(--xl)',
              display: page ? undefined : 'flex',
              flex: 1,
            }}
          >
            {page && (
              <ReactMarkdown className="remark-render" rehypePlugins={[hglt]}>
                {page.text}
              </ReactMarkdown>
            )}
            {!page && (
              <Column gap="xl">
                <div>
                  <Title content="Database" />
                  <Caption content="Find all the data you need. Every article has its own table of contents. You can navigate with the left navigation bar." />
                </div>
                <Column gap="s">
                  <SubTitle content="Guides" />
                  <div className={styles.cardDocs}>
                    {documentation.guides.map(doc => (
                      <Link
                        to={`/database/${toURI(doc.title)}`}
                        className={styles.cardDoc}
                      >
                        {doc.title}
                      </Link>
                    ))}
                  </div>
                </Column>
                <Column gap="s">
                  <SubTitle content="Encyclopaedia" />
                  <div className={styles.cardDocs}>
                    {documentation.encyclopaedia.map(doc => (
                      <Link
                        to={`/database/${toURI(doc.title)}`}
                        className={styles.cardDoc}
                      >
                        {doc.title}
                      </Link>
                    ))}
                  </div>
                </Column>
                <div style={{ flex: 1 }} />
                <div className={styles.writeUs}>
                  You want to add something to the database? You can!{' '}
                  <a
                    href="mailto:hivert.is.coming@gmail.com"
                    style={{ textDecoration: 'underline' }}
                  >
                    Shoot us an email
                  </a>{' '}
                  and we’ll make a pleasure to publish your article directly in
                  the database! After that, you can go to posterity!
                </div>
              </Column>
            )}
          </div>
        </div>
      </Row>
    </Main>
  )
}
