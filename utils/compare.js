export default function compare( a, b ) {
    if ( a.Points < b.Points ){
      return 1;
    }
    if ( a.Points > b.Points ){
      return -1;
    }
    return 0;
  }