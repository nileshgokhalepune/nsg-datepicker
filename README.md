# nsg-datepicker
A Simple Angular 2 DatePicker

**nsg-datepicker** is a datepicker component for Angular 2 RC1

##Demo

##Installation
````shell
npm install --save nsg-datepicker
````

## Example

```ts
import {Component} from '@angular/core';
import {DatePicker} from 'nsg-datepicker/nsg-datepicker';

@Component({
    selector: 'app',
    directives:[DatePicker]
    template:`
            <h1>Hello Angular 2 DatePicker</h1>
            <datepicker [(ngModel)]="myDateValue" dateFormat="MM/DD/YYYY"></datepicker>
           `
});
export class AppComponent{
    myDateValue: any;
}
```

![alt tag](https://github.com/nileshgokhalepune/nsg-datepicker/blob/master/snapshot.JPG)

## Author

Nilesh Gokhale

## License

UNLICENSED. You can use this datepicker at your own risk. Feel free to modify the code as you like based on your requriements.