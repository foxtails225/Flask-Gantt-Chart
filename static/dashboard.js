$(function () {
        let traces = [];
        let tData = [];
        let selectedChart;
        const colorSet = ['#808000', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#0000FF', '#FF0000', '#000080', '#008080',
            '#008000', '#800080', '#800000', '#808080', '#FEC433', '#C0C0C0'];

        function getData(callback) {
            $.ajax({
                url: 'readExcel/api/v1.0/dashboard',
                type: "GET",
                dataType: "json",
                contentType: 'text/html; charset=utf-8',
            }).done((d) => {
                let data = JSON.parse(JSON.stringify(d));
                callback(data);
                $('.dropdown-item').click(function () {
                    selectedChart = $(this).text();
                    showChart(selectedChart, data);
                });
            });
        }

        getData((data) => showDropbox(data));
        getData((data) => showChart(selectedChart, data));

        function showDropbox(data) {
            selectedChart = Object.keys(data)[0];
            let dropboxItems = Object.keys(data).map(item => {
                return (
                    '<div class="dropdown-item">' + item + '</div>'
                )
            });

            $(".dropdown-menu").append(dropboxItems);
        }


        function formatDate(sDate, delta) {
            if (!sDate)
                return '';

            let lDate = new Date(sDate);

            let d = lDate.getDate();
            let dd = d < 10 ? '0' + d : d;
            let yyyy = lDate.getFullYear();
            let mon = eval(lDate.getMonth() + 1);
            let mm = (mon < 10 ? '0' + mon : mon);

            return yyyy + delta + '-' + mm + '-' + dd;
        }

        function showTable(tData, chart_type) {
            let table_data = tData.map(item => {
                return ('<tr>\n' +
                    '<td>' + item.Customer + '</td>\n' +
                    '<td>' + item.Chart_Type + '</td>\n' +
                    '<td>' + item.Link_Type + '</td>\n' +
                    '<td>' + item.SFreq_GHz.toFixed(7) + '</td>\n' +
                    '<td>' + item.EFreq_GHz.toFixed(7) + '</td>\n' +
                    '<td>' + formatDate(item.SDate, 0) + '</td>\n' +
                    '<td>' + formatDate(item.EDate, 0) + '</td>\n' +
                    '</tr>\n'
                )
            });

            $("#result").append(table_data);
        }

        function showChart(selectedChart, data) {
            $("#grantt").empty();
            $("#result").empty();
            $("#dropdown").empty().text(selectedChart);

            traces = [];
            tData = [];
            let x_start = 0, y_start = 0, x_step = 0, y_step = 0, y_stop = 0;

            Object.keys(data).map(item => {
                if (item === selectedChart) {
                    let pre_item = item;
                    if (!("data" in data[item])) {
                        x_start = data[item].X_Axis_Start;
                    } else {
                        x_start = data[item].data[0].SDate;
                    }

                    x_step = data[item].X_Axis_Step_Size;
                    y_step = data[item].Y_Axis_Step_Size;
                    y_start = data[item].Y_Axis_Start;
                    y_stop = data[item].Y_Axis_Stop;

                    if ("data" in data[pre_item]) {
                        data[item].data.map(function (dt, index) {
                            let item_date = new Date(dt.SDate);
                            let c_date = new Date(x_start);
                            let y_point = dt.SFreq_GHz + Math.abs(dt.SFreq_GHz - dt.EFreq_GHz) / 2;
                            let isLegend = true;
                            tData.push(dt);

                            if (item_date < c_date) {
                                x_start = dt.SDate;
                            }

                            data[item].data.map((d, idx) => {
                                if (idx < index && d.Customer === dt.Customer) {
                                    index = idx;
                                    isLegend = false
                                }
                            });

                            let trace = {
                                name: dt.Customer,
                                x: [dt.SDate, dt.EDate],
                                y: [y_point, y_point],
                                mode: 'lines',
                                line: {
                                    width: Math.abs(dt.SFreq_GHz - dt.EFreq_GHz) / (y_step * 10) * 340,
                                    color: colorSet[index % colorSet.length]
                                },
                                showlegend: isLegend
                            };

                            traces.push(trace);
                        });
                    } else {
                        let trace = {
                            name: '',
                            x: [x_start, x_start + 10],
                            y: [y_start, y_start],
                            mode: 'lines',
                            line: {
                                width: Math.abs(y_start - y_stop) / (y_step * 10) * 340,
                                color: "transparent"
                            },
                            showlegend: false,
                            marker: {
                                size: 12,
                                shape: ['line-ew', "diamond-open", "line-ew", "line-ew", "diamond-open", "line-ew"]
                            },
                        };
                        traces.push(trace);
                    }

                    showTable(tData, item);
                }
            });

            var layout = {
                xaxis: {
                    title: '',
                    titlefont: {
                        size: 10,
                        color: '#212529',
                    },
                    tickfont: {
                        size: 12
                    },
                    range: [formatDate(x_start, -1), formatDate(x_start, 7)],
                    dtick: "M12",
                    showgrid: true,
                    zerolinecolor: '#969696',
                    zerolinewidth: 1,
                },
                yaxis: {
                    title: 'Frequency (GHZ)',
                    titlefont: {
                        size: 12,
                        color: '#212529',
                    },
                    tickfont: {
                        size: 12
                    },
                    range: [y_start, y_stop],
                    dtick: y_step,
                    showgrid: true,
                    zerolinecolor: '#969696',
                    zerolinewidth: 1,
                },
                legend: {
                    orientation: 'h',
                    xanchor: 'right',
                    x: 1,
                    traceorder: 'normal',
                    font: {
                        family: 'sans-serif',
                        size: 12,
                        color: '#000'
                    },
                    bordercolor: '#212529',
                    borderwidth: 1,
                    tracegroupgap: 100
                },
                margin: {
                    l: 60,
                    b: 80,
                    r: 30,
                    t: 30,
                    pad: 5,
                },
                showlegend: false,
                updatemenus: [{
                    type: 'buttons',
                    buttons: [{
                        label: '≡',
                        method: 'relayout',
                        args: ['showlegend', true],
                    }],
                    xanchor: 'left',
                    yanchor: 'bottom',
                    y: -0.18,
                    wrappeditems: true
                }],
            };

            Plotly.newPlot('grantt',
                traces, layout, {displayModeBar: false});
        }
    }
);