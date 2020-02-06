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



function getRows(forms) {
    const rows1 = [];
    forms.forEach(form => {
        const row = [];
        form.fields.forEach(field => {
            row.push(field.value);
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
    // var headCells = [
    //     { id: 'name', numeric: false, disablePadding: true, label: 'Dessert (100g serving)' },
    //     { id: 'dude', numeric: true, disablePadding: false, label: 'Dudes (num)' },
    //     { id: 'calories', numeric: true, disablePadding: false, label: 'Calories' },
    //     { id: 'fat', numeric: true, disablePadding: false, label: 'Fat (g)' },
    //     { id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)' },
    //     { id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)' },
    // ];

    var headCells = [];
    fields.forEach(item => {
        headCells.push({
            id: item.name,
            numeric: (item.type === "Number" ? true : false),
            disablePadding: true,
            label: item.title
        })
    })

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
            <Typography className={classes.title} variant="h6" id="tableTitle">
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

function EnhancedTable(props) {
    const classes = useStyles();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const rows = getRows(props.allData);

    const headCells = getHead(props.form.fields);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClick = (event, name) => {
        //TODO: show details
        // <Redirect to={`/2/3`} />
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
                            //onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            // rowCount={rows.length}
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
                                            onClick={event => handleClick(event, row.name)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={index}
                                            selected={isItemSelected}
                                            component={Link}
                                            to={`/ccagent/${props.form.formId}/${rowIndex}`}
                                        >
                                            {cells}
                                        </TableRow>
                                    );
                                })}
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

function getForm(formID) {
    var form1 = {
        "formId": 1,
        "_id": 1,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Niki"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Nazaran"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "22"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1998"
            },
        ]
    }
    var form2 = {
        "formId": 1,
        "_id": 2,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Reza"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Ferdosi"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "21"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1999"
            },
        ]
    }
    var form3 = {
        "formId": 1,
        "_id": 3,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Parsa"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Hejabi"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "21"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1998"
            },
        ]
    }
    var form4 = {
        "formId": 1,
        "_id": 4,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Niki"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Nazaran"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "22"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1998"
            },
        ]
    }
    var form5 = {
        "formId": 1,
        "_id": 5,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Reza"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Ferdosi"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "21"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1999"
            },
        ]
    }
    var form6 = {
        "formId": 1,
        "_id": 6,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Parsa"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Hejabi"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "21"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1998"
            },
        ]
    }
    var form7 = {
        "formId": 1,
        "_id": 7,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Niki"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Nazaran"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "22"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1998"
            },
        ]
    }
    var form8 = {
        "formId": 1,
        "_id": 8,
        "title": "Form 1",
        "fields": [
            {
                "name": "FirstName",
                "title": "First Name",
                "type": "Text",
                "value": "Reza"
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "type": "Text",
                "value": "Ferdosi"
            },
            {
                "name": "Age",
                "title": "Age",
                "type": "Number",
                "value": "21"
            },
            {
                "name": "BirthYear",
                "title": "Year of Birth",
                "type": "Number",
                "value": "1999"
            },
        ]
    }
    var forms = [form1, form2, form3, form4, form5, form6, form7, form8];
    return forms;
}

export default function CCpage() {
    var formID = useParams().id;
    //TODO: get the form
    var forms = getForm(formID);

    return (
        <Router>
            <Switch>
                <Route path="/ccagent/:formid/:id">
                    <FormDetails allData={forms} title={forms[0].title} form={forms[0]} />
                </Route>
                <Route path="/">
                    <EnhancedTable title={forms[0].title} form={forms[0]} allData={forms} />
                </Route>
            </Switch>
        </Router>
    );
}