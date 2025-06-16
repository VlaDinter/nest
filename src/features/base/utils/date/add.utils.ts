export class Add {
  static month(date: Date, month: number): Date {
    const result = new Date(date);

    result.setMonth(result.getMonth() + month);

    return result;
  }

  static days(date: Date, days: number): Date {
    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
  }

  static hours(date: Date, hours: number): Date {
    const result = new Date(date);

    result.setHours(result.getHours() + hours);

    return result;
  }

  static minutes(date: Date, minutes: number): Date {
    const result = new Date(date);

    result.setMinutes(result.getMinutes() + minutes);

    return result;
  }

  static seconds(date: Date, seconds: number): Date {
    const result = new Date(date);

    result.setSeconds(result.getSeconds() + seconds);

    return result;
  }
}
