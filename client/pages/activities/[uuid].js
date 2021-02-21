import Head from 'next/head'
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components'
import {
    useTable, useFilters, usePagination,
    useSortBy
} from 'react-table';
import Layout from '../../components/layout';
import Modal from '../../components/modal';
import { API_URL } from '../../constants';
import styles from './activity.module.css';

const Style = styled.div`
  padding: 1rem;
  .errorText {
      text-align: center;
      font-weight: 600;
      color:  #cc0000
  }
  .table-container {
      min-width: 800px;
      display: flex;
      flex-flow: column wrap;
      margin: 1rem 0;
      align-content: center;
  }

  .buttonWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  table {
    border-spacing: 0;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }


    th,
    td {
      padding: 1rem;
      border-bottom: 1px solid #D3D3D3;

      :last-child {
        border-right: 0;
      }
      
    }

    th {
        text-align: left;
    }

    tfoot {
      tr:first-child {
        td {
          border-top: 2px solid #D3D3D3;
        }
      }
      font-weight: bolder;
    }
  }


`



function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
}) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = useMemo(() => {
        const options = new Set()
        preFilteredRows.forEach(row => {
            options.add(row.values[id])
        })
        return [...options.values()]
    }, [id, preFilteredRows])

    // Render a multi-select box
    return (
        <select
            value={filterValue}
            onChange={e => {
                setFilter(e.target.value || undefined)
            }}
        >
            <option value="">Wszystkie</option>
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </select>
    )
}

function Table({ columns, data, income, cost, revenue, uuid, year, profitYear, setProfitYear }) {

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable({
        columns,
        data,
    },
        useFilters,
        useSortBy,
        usePagination,
    )

    return (
        <div className="table-container">
            <div className="pagination">
                <span>
                    Strona{' '}
                    <strong>
                        {pageIndex + 1} z {pageOptions.length}
                    </strong>{' '}
                </span>
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </button>{' '}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>{' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>{' '}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </button>{' '}
                <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Pokazuj {pageSize}
                        </option>
                    ))}
                </select>
            </div>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    <div {...column.getSortByToggleProps()}>
                                        {column.render('Header')}
                                        <span>
                                            {column.isSorted
                                                ? column.isSortedDesc
                                                    ? ' ▼'
                                                    : ' ▲'
                                                : ''}
                                        </span>
                                    </div>
                                    <div>{column.Filter ? column.render('Filter') : null}</div>
                                </th>
                            ))}

                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td><a href={`${API_URL}download/${uuid}/`}>Pobierz csv</a></td>
                        <td></td>
                        <td>Za rok <select value={profitYear} onChange={e => setProfitYear(e.target.value)}>
                            <option value='2020'>2020</option>
                            <option value='2021'>2021</option>
                        </select></td>
                        <td>Koszt {cost} PLN</td>
                        <td>Przychód {income} PLN</td>
                        <td>Dochód {revenue} PLN</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

const Activities = () => {
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const router = useRouter();
    const [profitYear, setProfitYear] = useState(2020);
    const { uuid } = router.query;


    const fetchActivities = () => {
        setData(null);
        fetch(`${API_URL}activity/${uuid}?year=${profitYear}`)
            .then(res => {
                if(res.status !== 200) {
                    throw Error('Wystąpił błąd serwera, spróbuj ponownie później')
                } else {
                    return res.json()
                }
            })
            .then(data => {
                setData(data);
            }
            ).catch(error => {
                setError(`${error}`);
            })
    }

    useEffect(() => {
        if (uuid) {
            fetchActivities();
        }
    }, [uuid, profitYear]);

    const columns = useMemo(() => [
        {
            Header: 'Data transakcji',
            accessor: 'settle_date',
        },
        {
            Header: 'Waluta',
            accessor: 'currency',
        },
        {
            Header: 'Cena',
            accessor: 'price',
        },
        {
            Header: 'Ilość',
            accessor: 'quantity',
            Footer: 'Koszt'
        },
        {
            Header: 'Spółka',
            accessor: 'symbol',
            Filter: SelectColumnFilter,
            filter: 'equals',
            Footer: 'Zysk',
        },
        {
            Header: 'Akcja',
            accessor: 'type',
            Filter: SelectColumnFilter,
            filter: 'equals',
            Footer: 'Dochód'
        },

    ], [])


    if (error) {
        return (<Layout>
            <div className={styles.errorText}>Wystąpił błąd {error}</div>
        </Layout>)
    }

    if (data) {
        if (data.error && !data.activities) return (
            <Layout>
                <div className={styles.errorText}>{data.error}</div>
            </Layout>)

        const { activities, income, revenue, cost, year } = data;

        if (activities) {
            const symbols = activities.map(a => a.symbol);

            return (
                <Layout>
                    <Head>
                        <meta property="og:title" content="PIT Kalkulator Demo" />
                        <meta property="og:description" content="Przetestuj działanie kalkulatora, bez potrzeby podawania własnych transakcji" />
                        <meta property="og:image" content="https://pitkalkulator.pl/static/img/activity.jpg" />
                        <meta property="og:url" content="https://pitkalkulator.pl/activity/demo" />
                        <meta property="og:type" content="website" />
                        <meta property="og:site_name" content="PIT Kalkulator" />

                        <meta name="twitter:card" content="summary" />
                        <meta name="twitter:title" content="PIT Kalkulator Demo" />
                        <meta name="twitter:description" content="Przetestuj działanie kalkulatora, bez potrzeby podawania własnych transakcji" />
                        <meta name="twitter:image" content="https://pitkalkulator.pl/static/img/activity.jpg" />

                        <meta name="description" content="Przetestuj działanie kalkulatora, bez potrzeby podawania własnych transakcji" />
                        <meta name="keywords" content="pitkalkulator demo, przykład działania pitkalkulator" />
                        <title>Transakcje | pitkalkulator </title>
                    </Head>
                    <Style>
                        <div className="errorText">{data.error}</div>
                        <Table columns={columns} data={activities}
                            cost={cost}
                            revenue={revenue}
                            income={income}
                            uuid={uuid}
                            year={year}
                            profitYear={profitYear}
                            setProfitYear={setProfitYear} />
                        <div className="buttonWrapper">
                            <button onClick={() => {setVisible(!visible); window.scrollTo(0, 0)}}>Dodaj transakcje</button>
                        </div>
                        {visible ?
                            <Modal
                                request_id={uuid}
                                symbols={symbols}
                                visibleUpdated={() => {setVisible(!visible); fetchActivities();}}
                            ></Modal> : <div></div>}
                    </Style>
                </Layout>

            )
        } else return (<Layout>
            <div className={styles.errorText}>Wystąpił błąd</div>
        </Layout>)
    }

    return (
        <Layout>
            <div className={styles.loader}>Loading...</div>
        </Layout>)

}

export default Activities;
