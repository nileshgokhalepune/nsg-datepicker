/// <reference path="../moment/moment.d.ts" />
/// <reference path="../moment/moment-node.d.ts" />

import {Component, Input, OnInit, ElementRef} from '@angular/core';
import {FORM_DIRECTIVES, NgClass, NgFor, NgModel, ControlValueAccessor} from '@angular/common';
//this is a workaround to get moment js working with typescript
import * as moment_ from 'moment';
const moment: moment.MomentStatic = (<any>moment_)['default'] || moment_;

@Component({
    selector: 'datepicker[ngModel]',
    host: {
        '(document:click)': 'onDocumentClick($event)'
    },
    styles: [`
        .date-container{
            margine:5px;
            padding:2px;
            position:relative;
        }
        
        .dpDropClosed{
            display:none;
        }
        .dpDropOpen{
            display:block;
            position:absolute;
            z-index:9999;
            min-width:70%;
        }
        .yearLabel{
            text-align: center;
            background-color: #000;
            color:#fff;
            font-weight:bold;
            border:1px solid black;
            border-style: outset;
        }
        .monthLabel{
            border:1px solid black;
        }
        .month-navigate-left{
            font-weight: bold;
            display: inline;
            width:10%;
            float:left;
        }
        .month-navigate-right{
            font-weight: bold;
            display: inline;
            width:10%;
            float:right;
        }
        .month-button{
            font-weight: bold;
            display: inline;
            width:80%;
        }
        .pointer{
            cursor: pointer;
            text-align:center;
        }
        .pointer:hover{
            box-shadow:0 1px 3px rgba(0,12,12,12.12), 0 1px 2px rgba(0,0,0,0.24);
            text-align:center;
        }
        
        .table{
            background-color: #F4F4F4;
            border:1px solid green;
            font-size:12px;
        }
        .selectedDay{
            background-color:green;
            color:white;
        }
        .currentDay{
            border:1px solid red!important;
        }
        .inline{
            display:flex;
            flex-direction:row;
            padding:3px;
            min-width:100%;
        }
    `],
    template: `
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
    <div class="date-container" [style.margin-left]="2 + 'px'" [style.margin-top]="2 + 'px'" [style.margin-right]="2 + 'px'" [style.width]="200 + 'px'">
            <div [style.width]="100 + '%'"> <input type='text' [value]="!dateChanged && showDeaultDate ===false ? null : selDate" (blur)="blur($event)"  (keypress)="valueChanging()"/><i class='fa fa-calendar-o pointer' (click)="displayDateBox($event)"></i></div>
            <div [ngClass]="{dpDropClosed: isClosed, dpDropOpen: !isClosed}">
                <div class="yearLabel">{{year}}</div>
                <div>                
                    <div class="monthLabel">
                        <button class="month-navigate-left" (click)="previousMonth($event)"><i class="fa fa-angle-left"></i></button>
                        <button class="month-button" (click)="enableMonthView()">{{monthName}}</button>
                        <button class="month-navigate-right" (click)="nextMonth($event)"><i class="fa fa-angle-right"></i></button>
                    </div>
                    <table class="table" *ngIf="!monthView">
                        <tr class="dayLabelRow">
                            <th *ngFor="let day of calDaysLabel">
                                <span>{{day}}</span>
                            </th>
                        </tr>
                        <tr *ngFor="let days of dayRows">
                            <td *ngFor="let day of days">
                                <div  (click)="selectDate(day)" title="{{curDay==day ? 'Today' : ''}}" [ngClass]="{selectedDay: day==selDay && month==selectedMonth, currentDay: day==curDay && selectedMonth==curMonth}" class="pointer">
                                    <span>{{day}}</span>  
                                </div>
                            </td>
                        </tr>
                    </table> 
                    <table class="table" *ngIf='monthView'>
                        <tr>
                            <td *ngFor="let cell of [0,1,2,3]" [style.width]="25 + '%'">
                                <label class="pointer" (click)="selectMonth(cell)">{{shortCalMonthsLabel[cell]}}</label>
                            </td>
                        </tr>
                        <tr>
                            <td *ngFor="let cell of [4,5,6,7]" [style.width]="25 + '%'">
                                <label class="pointer" (click)="selectMonth(cell)">{{shortCalMonthsLabel[cell]}}</label>
                            </td>
                        </tr>
                        <tr>
                            <td *ngFor="let cell of [8,9,10,11]" [style.width]="25 + '%'">
                                <label class="pointer" (click)="selectMonth(cell)">{{shortCalMonthsLabel[cell]}}</label>
                            </td>
                        </tr>
                    </table>
                </div>
        </div>
    </div>
    `,
    providers: [],
    directives: [NgFor, NgClass, FORM_DIRECTIVES],
    pipes: []
})

export class DatePicker implements OnInit, ControlValueAccessor {
    private selDate: string;
    private selDay: number;
    private curDay: number;
    private curMonth: number;
    private onChange: Function;
    private onTouched: Function;
    private isClosed: boolean = true;
    private calDaysLabel: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    private calMonthsLabel: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    private shortCalMonthsLabel: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Octr', 'Nov', 'Dec'];
    private calDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    private totalMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    private today: moment.Moment;
    private month: number;
    private year: number;
    private date: number;
    private monthName: string;
    private dayRows: any[];
    private dayCells: string[];
    private selectedMonth: number;
    private montIndex = 0;
    private dateView: boolean = true;
    private monthView: boolean = false;
    private yearView: boolean = false;
    private cd: any;
    private typed: boolean = false;
    private dateChanged: boolean = false;
    private monthButtonClicked: boolean = false;

    @Input('date-format') dateFormat: string;
    @Input('start-date') startDate: string;
    @Input('show-default-date') showDeaultDate: boolean = false;

    ngOnInit(): void {
        var firstDay = new Date(this.year, this.month, 1);
        var startingDay = firstDay.getDay();
        var monthLength = this.calDaysInMonth[this.month];
        if (this.month === 1) {
            if ((this.year % 4 === 0 && this.year % 100 !== 0) || this.year % 400 === 0) {
                monthLength = 29;
            }
        }
        this.dayRows = new Array();
        this.generateCalendar(startingDay);
        this.selDate = this.today.format(this.dateFormat);
        this.selDay = moment(this.selDate).get("date");
        this.curDay = moment(this.selDate).get('date');
        this.curMonth = moment(this.selDate).get('month');
    }

    constructor(cd: NgModel, private _eref: ElementRef) {
        cd.valueAccessor = this;
        this.cd = cd;
        this.today = moment();
        this.month = this.today.get("month");
        this.year = this.today.get("year");
        this.date = this.today.get("date");
        this.selectedMonth = this.month;
        if (!this.dateFormat)
            this.dateFormat = "YYYY-MM-DD";

        this.initValue();
    }

    private displayDateBox(event: any): void {
        event.preventDefault();
        event.stopPropagation();
        this.isClosed = !this.isClosed;
    }

    private generateCalendar(startingDay: number): void {
        var monthLength = this.calDaysInMonth[this.selectedMonth];
        var day = 1
        for (var index = 0; index < 7; index++) {
            var dayCells = new Array();
            if (day > monthLength) break;
            for (var j = 0; j < 7; j++) {
                if (day <= monthLength && (index > 0 || j >= startingDay)) {
                    dayCells.push(day);
                    day++;
                } else if (j < startingDay && index < 7 && day <= monthLength || day > monthLength) {
                    dayCells.push('');
                }
            }
            if (dayCells.length > 0)
                this.dayRows.push(dayCells);
        }
        this.monthName = this.calMonthsLabel[this.selectedMonth];
    }

    private nextMonth(event: any): void {
        event.preventDefault();
        event.stopPropagation();
        console.log('next month');
        if (this.selectedMonth === 11) {
            this.selectedMonth = 0;
            this.year += 1;
        } else {
            this.selectedMonth += 1;
        }
        this.dayRows = new Array();
        var firstDay = new Date(this.year, this.selectedMonth, 1);
        var startingDay = firstDay.getDay();
        this.generateCalendar(startingDay);
    }

    private previousMonth(event: any): void {
        event.preventDefault();
        event.stopPropagation();
        console.log('previous month');
        if (this.selectedMonth === 0) {
            this.selectedMonth = 11;
            this.year -= 1;
        } else {
            this.selectedMonth -= 1;
        }
        this.dayRows = new Array();
        var firstDay = new Date(this.year, this.selectedMonth, 1);
        var startingDay = firstDay.getDay();
        this.generateCalendar(startingDay);
    }

    private selectDate(day: number): void {
        if (!day) return;
        this.dateChanged = true;
        var selected = new Date(this.year, this.selectedMonth, day);
        this.selDate = moment(selected).format(this.dateFormat);
        this.selDay = moment(this.selDate).get("date");
        this.setValue(this.selDate);
        this.isClosed = true;
    }

    private enableMonthView() {
        this.dateView = false;
        this.monthView = true;
        this.yearView = false;
        this.monthButtonClicked = true;
    }

    private onDocumentClick(event: any) {
        if (event.target !== this._eref.nativeElement && !this.monthButtonClicked) {
            this.isClosed = true;
            this.monthView = false;
        } else {
            this.monthButtonClicked = false;
        }
    }

    private setValue(value: any): void {
        if (!this.dateChanged && this.showDeaultDate === false) return;
        let val = moment(value, this.dateFormat || 'YYYY-MM-DD');
        this.cd.viewToModelUpdate(val);
    }

    private blur(event: any): void {
        if (this.typed) {
            let val = event.target.value;
            this.selDate = moment(val).format(this.dateFormat);
            if (this.selDate === 'Invalid Date') {
                this.selDate = moment().format(this.dateFormat);
            }
            this.setValue(this.selDate);
            this.typed = false;
        }
    }

    private valueChanging(): void {
        this.typed = true;
    }

    private initValue(): void {
        setTimeout(() => {
            if (!this.selDate) {
                this.setValue(moment().format(this.dateFormat || 'YYYY-MM-DD'));
            } else {
                this.setValue(moment(this.selDate, this.dateFormat || 'YYYY-MM-DD'));
            }
        });
    }

    writeValue(value: string): void {
    }

    registerOnChange(fn: (_: any) => {}): void {
    }

    registerOnTouched(fn: (_: any) => {}): void {
    }

    private selectMonth(month: number) {
        this.monthView = false;
        this.dateView = true;
        this.selectedMonth = month;
        this.monthButtonClicked = true;
        this.dayRows = new Array();
        var firstDay = new Date(this.year, month, 1);
        var startingDay = firstDay.getDay();
        this.generateCalendar(startingDay)
    }
} 