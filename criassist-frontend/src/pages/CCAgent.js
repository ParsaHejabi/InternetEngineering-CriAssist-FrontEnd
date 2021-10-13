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
import { FORM_FIELDS, FORM_ALLDATA, AREA_NAMES, AREA_WITH_GIVEN_POINT } from "../global/queries";
import Skeleton from '@material-ui/lab/Skeleton';
import { Toolbar } from "@material-ui/core";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import moment from 'moment';
import FileSaver from 'file-saver';

function getRows(forms, fields, areaFilter, numberFilter, dateFilter) {
    const rows1 = [];
    var i = 1;
    forms.forEach(form => {
        const row = [];
        row.push(i);
        i++;
        var doPush = true;
        fields.forEach(temp => {
            if (!numberFilter.number && !dateFilter.date && !areaFilter.area) {
                if (form.value[temp.name]) {
                    if (temp.type.includes("Number"))
                        row.push(parseFloat(form.value[temp.name]));
                    else if (temp.type.includes("Date"))
                        row.push(moment(new Date(form.value[temp.name])).format('YYYY MMMM Do'));
                    else if (temp.type.includes("Location")) {
                        var areas = "";
                        if (form.value["Areas"])
                            form.value["Areas"].forEach(area => areas = areas.concat(" ", area));
                        row.push(areas);

                    } else row.push(form.value[temp.name]);

                } else
                    row.push(" ");
            } else {
                if (numberFilter.field !== "" && numberFilter.number && numberFilter.field === temp.name) { // We are filtering this field
                    if (parseFloat(form.value[temp.name]) === numberFilter.number) { // This form passes the filtering
                        row.push(parseFloat(form.value[temp.name]));
                    } else doPush = false;
                }
                if (dateFilter.field !== "" && dateFilter.date && dateFilter.field === temp.name) { // We are filtering this field
                    if (form.value[temp.name] === dateFilter.date) { // This form passes the filtering
                        row.push(moment(new Date(form.value[temp.name])).format('YYYY MMMM Do'));
                    } else doPush = false;
                }
                if (areaFilter.field !== "" && areaFilter.area && areaFilter.field === temp.name) { // We are filtering this field
                    if (form.value["Areas"].includes(areaFilter.area)) { // This form passes the filtering
                        areas = "";
                        if (form.value["Areas"])
                            form.value["Areas"].forEach(area => areas = areas.concat(" ", area));
                        row.push(areas);
                    } else doPush = false;
                }
                if (!(numberFilter.field !== "" && numberFilter.number && numberFilter.field === temp.name) && !(areaFilter.field !== "" && areaFilter.area && areaFilter.field === temp.name) && !(dateFilter.field !== "" && dateFilter.date && dateFilter.field === temp.name)) {
                    if (form.value[temp.name]) {
                        if (temp.type.includes("Number"))
                            row.push(parseFloat(form.value[temp.name]));
                        else if (temp.type.includes("Date"))
                            row.push(moment(new Date(form.value[temp.name])).format('YYYY MMMM Do'));
                        else if (temp.type.includes("Location")) {
                            areas = "";
                            if (form.value["Areas"])
                                form.value["Areas"].forEach(area => areas = areas.concat(" ", area));
                            row.push(areas);

                        } else row.push(form.value[temp.name]);

                    } else
                        row.push(" ");
                }
            }
        })
        if (doPush)
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
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
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
    const { formName, fields, areaNames, allNumbers, allDates } = props;
    const { setNumberFilter, setAreaFilter, setDateFilter } = props;
    const [areaField, setAreaField] = React.useState('');
    const [area, setArea] = React.useState('');
    const [numberField, setnumberField] = React.useState('');
    const [number, setnumber] = React.useState('');
    const [dateField, setdateField] = React.useState('');
    const [date, setdate] = React.useState('');
    var areaFieldItems = [];
    var areaItems = [];
    var numberFieldItems = [];
    var numberItems = [];
    var dateFieldItems = [];
    var dateItems = [];
    var areaSection = <div></div>;
    var numberSection = <div></div>;
    var dateSection = <div></div>;
    const handleAreaFieldChange = event => {
        setAreaField(event.target.value);
        setAreaFilter({
            field: event.target.value,
            area: area
        });
    };
    const handleAreaChange = event => {
        setArea(event.target.value);
        setAreaFilter({
            field: areaField,
            area: event.target.value
        });
    };
    const handlenumberFieldChange = event => {
        setnumberField(event.target.value);
        setNumberFilter({
            field: event.target.value,
            number: number
        });
    };
    const handlenumberChange = event => {
        setnumber(event.target.value);
        setNumberFilter({
            field: numberField,
            number: event.target.value
        });
    };
    const handledateFieldChange = event => {
        setdateField(event.target.value);
        setDateFilter({
            field: event.target.value,
            date: date
        });
    };
    const handledateChange = event => {
        setdate(event.target.value);
        setDateFilter({
            field: dateField,
            date: event.target.value
        });
    };

    if (fields.filter(element => element.type.includes("Location")).length > 0) {
        fields.filter(element => element.type.includes("Location")).forEach(field => {
            areaFieldItems.push(
                <MenuItem value={field.name}>{field.title}</MenuItem>
            );
        })
        areaNames.forEach(area => {
            areaItems.push(
                <MenuItem value={area.name}>{area.name}</MenuItem>
            );
        })
        areaSection = (
            <div>
                <FormControl className={classes.formControl} >
                    <InputLabel id="demo-simple-select-label">Area Field</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={areaField}
                        onChange={handleAreaFieldChange}
                    >
                        {areaFieldItems}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label">Area</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={area}
                        onChange={handleAreaChange}
                    >
                        {areaItems}
                    </Select>
                </FormControl>
            </div>
        );
    }

    if (fields.filter(element => element.type.includes("Number")).length > 0) {
        fields.filter(element => element.type.includes("Number")).forEach(field => {
            numberFieldItems.push(
                <MenuItem value={field.name}>{field.title}</MenuItem>
            );
        })
        allNumbers.forEach(number => {
            numberItems.push(
                <MenuItem value={number}>{number}</MenuItem>
            );
        })
        numberSection = (
            <div>
                <FormControl className={classes.formControl} >
                    <InputLabel id="demo-simple-select-label">Number Field</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={numberField}
                        onChange={handlenumberFieldChange}
                    >
                        {numberFieldItems}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label">Number</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={number}
                        onChange={handlenumberChange}
                    >
                        {numberItems}
                    </Select>
                </FormControl>
            </div>
        );
    }

    if (fields.filter(element => element.type.includes("Date")).length > 0) {
        fields.filter(element => element.type.includes("Date")).forEach(field => {
            dateFieldItems.push(
                <MenuItem value={field.name}>{field.title}</MenuItem>
            );
        })
        allDates.forEach(date => {
            dateItems.push(
                <MenuItem value={date}>{date}</MenuItem>
            );
        })
        dateSection = (
            <div>
                <FormControl className={classes.formControl} >
                    <InputLabel id="demo-simple-select-label">Date Field</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={dateField}
                        onChange={handledateFieldChange}
                    >
                        {dateFieldItems}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label">Date</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={date}
                        onChange={handledateChange}
                    >
                        {dateItems}
                    </Select>
                </FormControl>
            </div>
        );
    }

    return (
        <Toolbar>
            <Typography className={classes.title} variant="h5" id="tableTitle">
                {formName}
            </Typography>
            {areaSection}
            {numberSection}
            {dateSection}
            <CloseIcon
                onClick={e => {
                    setDateFilter({});
                    setAreaFilter({});
                    setNumberFilter({});
                    setnumber("");
                    setnumberField("");
                    setdate("");
                    setdateField("");
                    setArea("");
                    setAreaField("");
                }}
            />
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        padding: "5%"
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
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

function getSumRow(headFields, answers) {
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

function prepData(allData, allNumbers, allDates, locationFields, fields) {
    fields.forEach(field => {
        if (field.type.includes("Number"))
            allData.forEach(data => {
                if (data.value[field.name] && !allNumbers.includes(parseFloat(data.value[field.name])))
                    allNumbers.push(parseFloat(data.value[field.name]));
            })
        else if (field.type.includes("Date"))
            allData.forEach(data => {
                if (data.value[field.name] && !allDates.includes(moment(new Date(data.value[field.name])).format('YYYY MMMM Do')))
                    allDates.push(moment(new Date(data.value[field.name])).format('YYYY MMMM Do'));
            })
    })


    locationFields.forEach(locationField => {
        var withLocation = allData.filter(element => element.value[locationField.name]);
        withLocation.forEach(data => {
            var areaNames = GetAreaWithGivenPoint({
                "lat": data.value[locationField.name].lat,
                "long": data.value[locationField.name].long
            })
            var temp = data;
            if (!areaNames.loading) {
                temp.value["Areas"] = areaNames.data.areaNamesOfGivenPoint;
                var index = allData.indexOf(data);
                allData[index] = temp;

            }

        })
    })
    return { allData, allNumbers, allDates };
}

function EnhancedTable(props) {
    const classes = useStyles();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [areaFilter, setAreaFilter] = React.useState({});
    const [numberFilter, setNumberFilter] = React.useState({});
    const [dateFilter, setDateFilter] = React.useState({});

    var areaNames = props.areaNames;
    var allData = props.allData;
    var locFields = props.form.form.fields.filter(element => element.type.includes("Location"));
    var allNumbers = [];
    var allDates = [];
    var all;

    all = prepData(allData, allNumbers, allDates, locFields, props.form.form.fields);

    allData = all.allData;
    allNumbers = all.allNumbers;
    allDates = all.allDates;


    var rows = getRows(allData, props.form.form.fields, areaFilter, numberFilter, dateFilter);

    const headCells = getHead(props.form.form.fields);

    var sumRow = getSumRow(props.form.form.fields, allData);

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

    const downloader = e => {
        var content = []
        var c = [];
        headCells.forEach(cell => {
            if (cell === " ") c.push("Row Numbers");
            else c.push(cell.label);
        })
        c.push("\r\n");
        content.push(c);
        rows.forEach(row => {
            row.push("\r\n");
            content.push(row);
        })
        var blob = new Blob(content, { type: "text/plain;charset=utf-8" });
        FileSaver.saveAs(blob, "info.csv");
    }

    const isSelected = name => selected.indexOf(name) !== -1;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    formName={props.title}
                    fields={props.form.form.fields}
                    areaNames={areaNames.areas}
                    allNumbers={allNumbers}
                    allDates={allDates}
                    setAreaFilter={setAreaFilter}
                    setNumberFilter={setNumberFilter}
                    setDateFilter={setDateFilter}
                />
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
                                    const rowIndex = allData[rows.indexOf(row)]._id;
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

                            <TableRow>
                                <TableCell align="right">
                                    <Typography variant="button" display="block" gutterBottom>
                                        جمع
                                        </Typography>
                                </TableCell>
                                {sumRow}
                            </TableRow>
                            <TableRow>
                                <TableCell align="right">
                                    <GetAppIcon onClick={downloader} />
                                </TableCell>
                                <TableCell>
                                    Download CSV file
                                    </TableCell>
                            </TableRow>

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
    return { data, loading };

}

const GetFormsData = props => {
    const { data, loading } = useQuery(FORM_ALLDATA, {
        variables: { "id": props }
    });
    return { data, loading };
}

const GetAreaNames = props => {
    const { data, loading } = useQuery(AREA_NAMES);
    return { data, loading };
}

const GetAreaWithGivenPoint = props => {
    const { data, loading } = useQuery(AREA_WITH_GIVEN_POINT, {
        variables: { "lat": props.lat, "long": props.long }
    });
    return { data, loading };
}


export default function CCpage() {
    var formID = useParams().id;
    var formTemplate = GetFormTemplate(formID);
    var forms = GetFormsData(formID);
    var areaNames = GetAreaNames();

    var answersPage = (
        <div>
            <Typography align="center" variant="h5" gutterBottom>در حال بارگذاری...</Typography>
            <Skeleton variant="rect" height={150} />
        </div>
    );
    var detailsPage = (
        <div>
            <Typography align="center" variant="h5" gutterBottom>در حال بارگذاری...</Typography>
            <Skeleton variant="rect" height={150} />
        </div>
    );
    if (!formTemplate.loading && !forms.loading && !areaNames.loading) {
        if (!forms.data) {
            answersPage = (
                <div>
                    <Typography align="center" variant="h5" gutterBottom>
                        There are no answers for this specific form.
                    </Typography>
                </div>
            );
            detailsPage = (
                <div>
                    <Typography align="center" variant="h5" gutterBottom>
                        There are no answers for this specific form.
                    </Typography>
                </div>
            );
        }
        else {
            answersPage = <EnhancedTable title={formTemplate.data.form.title} form={formTemplate.data} allData={forms.data.formAnswersWithGivenFormId} areaNames={areaNames.data} />;
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