import React from "react";
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { useParams, Link } from 'react-router-dom';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import FormDetails from './FormDetails';
import { useQuery } from "@apollo/react-hooks";
import { FORM_FIELDS, FORM_ALLDATA } from "../global/queries";


function getRows(forms, fields) {
    const rows1 = [];
    var fieldsNames = fields.map(y => y.name);
    var i = 1;
    forms.forEach(form => {
        const row = [];
        row.push(i);
        i++;
        fieldsNames.forEach(temp => {
            if (form.value[temp])
                row.push(form.value[temp]);
            else
                row.push(" ");
        })
        rows1.push(row);
    })
    return rows1;
}

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

function getHead(fields) {
    var headCells = [];
    headCells.push(" ");
    if (fields) {
        fields.forEach(item => {
            headCells.push({
                id: item.name,
                numeric: (item.type === "Number" ? true : false),
                disablePadding: true,
                label: item.title
            })
        })
    }

    return headCells;
}

function EnhancedTableHead(props) {
    const { classes, order, orderBy, onRequestSort, headCells } = props;
    const createSortHandler = property => event => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map(headCell => {
                    if (headCell.numeric) {
                        return (
                            <TableCell
                                key={headCell.id}
                                align={headCell.numeric ? 'right' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === headCell.id ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={orderBy === headCell.id ? order : 'asc'}
                                    onClick={createSortHandler(headCell.id)}
                                >
                                    {headCell.label}
                                    {orderBy === headCell.id ? (
                                        <span className={classes.visuallyHidden}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </span>
                                    ) : null}
                                </TableSortLabel>
                            </TableCell>
                        );
                    }
                    else return (
                        <TableCell
                            key={headCell.id}
                            // align={headCell.numeric ? 'right' : 'left'}
                            align={'right'}
                            padding={headCell.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            {headCell.label}
                        </TableCell>
                    );
                }
                )}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    //onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    //rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    title: {
        flex: '1 1 100%',
    },
}));

const EnhancedTableToolbar = props => {
    const classes = useToolbarStyles();
    const { formName } = props;

    return (
        <div>
            <Typography className={classes.title} variant="h5" id="tableTitle">
                {formName}
            </Typography>
        </div>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 750,
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

function getSumRow(headFields, answers) {
    var numericFields = headFields.find(element => element.type.includes("Number"))
    var cells = [];
    headFields.forEach(field => {
        if (field.type.includes("Number")) {
            var sum = 0;

            answers.forEach(answer => {
                if (answer.value[field.name]) {
                    sum += parseFloat(answer.value[field.name]);
                }
            })

            cells.push(
                <TableCell align="right">
                    <Typography variant="button" display="block" gutterBottom>
                        {sum}
                    </Typography>
                </TableCell>
            );
        } else {
            cells.push(
                <TableCell align="right">
                    {" "}
                </TableCell>
            );
        }
    });
    return cells;
}

function EnhancedTable(props) {
    const classes = useStyles();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const rows = getRows(props.allData, props.form.form.fields);

    const headCells = getHead(props.form.form.fields);

    var sumRow = getSumRow(props.form.form.fields, props.allData);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = name => selected.indexOf(name) !== -1;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <EnhancedTableToolbar numSelected={selected.length} formName={props.title} />
                <TableContainer>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                        aria-label="enhanced table"
                    >
                        <EnhancedTableHead
                            classes={classes}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                        />
                        <TableBody>
                            {stableSort(rows, getSorting(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const isItemSelected = isSelected(row.name);
                                    const cells = [];
                                    const rowValues = Object.values(row);
                                    const rowIndex = props.allData[rows.indexOf(row)]._id;
                                    rowValues.forEach(item => {
                                        cells.push(
                                            <TableCell align="right">
                                                {item}
                                            </TableCell>
                                        )
                                    });


                                    return (

                                        <TableRow
                                            hover
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={index}
                                            selected={isItemSelected}
                                            component={Link}
                                            to={`/ccagent/${props.form.form._id}/${rowIndex}`}
                                        >
                                            {cells}
                                        </TableRow>
                                    );
                                })}
                            {
                                <TableRow>
                                    <TableCell align="right">
                                        <Typography variant="button" display="block" gutterBottom>
                                            Sum
                                        </Typography>
                                    </TableCell>
                                    {sumRow}
                                </TableRow>
                            }
                            {emptyRows > 0 && (
                                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}

const GetFormTemplate = props => {
    const { data, loading } = useQuery(FORM_FIELDS, {
        variables: { "id": props }
    });
    return { data, loading }

}

const GetFormsData = props => {
    const { data, loading } = useQuery(FORM_ALLDATA, {
        variables: { "id": props }
    });
    return { data, loading }
}

export default function CCpage() {
    var formID = useParams().id;
    var formTemplate = GetFormTemplate(formID);

    var forms = GetFormsData(formID);

    var answersPage = <div>Loading</div>;
    var detailsPage = <div>Loading</div>;
    if (!formTemplate.loading && !forms.loading) {
        if (!forms.data) {
            answersPage = (
                <div>
                    <Typography variant="h4" gutterBottom>
                        No Answers Submitted For This Form.
                    </Typography>
                </div>
            );
            detailsPage = (
                <div>
                    <Typography variant="h4" gutterBottom>
                        No Answers Submitted For This Form.
                    </Typography>
                </div>
            );
        }
        else {
            answersPage = <EnhancedTable title={formTemplate.data.form.title} form={formTemplate.data} allData={forms.data.formAnswersWithGivenFormId} />;
            detailsPage = <FormDetails title={formTemplate.data.form.title} form={formTemplate.data} />;
        }

    }



    return (
        <Router>
            <Switch>
                <Route path="/ccagent/:formid/:id">
                    {detailsPage}
                </Route>
                <Route path="/">
                    {answersPage}
                </Route>
            </Switch>
        </Router>
    );
}