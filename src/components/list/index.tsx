import styles from './list.module.css'

export type Col = {
  key: string
  title: string
  map?: (e: any, all?: any) => any
  sort?: (e0: any, e1: any) => number
}

const List = ({
  cols,
  rows,
  click = () => {},
}: {
  cols: Array<Col>
  rows: Array<any>
  click?: (e: any) => void
}) => {
  return (
    <div className={styles.listContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {cols.map(({ key, title }) => (
              <th key={key + title}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(e => (
            <tr key={e.id} onClick={() => click(e)}>
              {cols.map(col => (
                <td key={`${col.key + col.title}-${e.id}`}>
                  {col.map ? col.map(e[col.key]) : e[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default List
