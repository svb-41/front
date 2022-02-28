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
  const sort = (col: Col) => () => {
    // if (col.sort) {
    //   rows.sort((e1, e2) => col.sort(e1[col.key], e2[col.key]))
    // }
  }

  return (
    <div className={styles.listContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col.key + col.title} onClick={sort(col)}>
                {col.title}
              </th>
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
