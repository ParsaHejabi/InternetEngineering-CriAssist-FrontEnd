import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { useQuery } from "@apollo/react-hooks";
import { FORM_ANSWER } from "../global/queries";

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

const GetOneAnswer = props => {
    const { data, loading } = useQuery(FORM_ANSWER, {
        variables: { "id": props }
    });
    return { data, loading }
}

export default function SimpleTable(props) {
    const classes = useStyles();
    var answerID = useParams().id;
    var answer = GetOneAnswer(answerID);

    var rows = [];
    if (!answer.loading) {
        var fieldKeys = Object.keys(answer.data.formAnswer.value);
        var fieldVals = Object.values(answer.data.formAnswer.value);
        fieldKeys.forEach(key => {
            var fieldTitle = (props.form.form.fields).find(element => element.name === key)
            rows.push(
                <TableRow>
                    <TableCell align="right">{fieldTitle.title}</TableCell>
                    <TableCell align="right">{answer.data.formAnswer.value[key]}</TableCell>
                </TableRow>
            );
        })
    }

    return (
        <div>
            <Typography variant="h5" gutterBottom>{props.title}</Typography>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">نام فیلد</TableCell>
                            <TableCell align="right"> مقدار فیلد</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}