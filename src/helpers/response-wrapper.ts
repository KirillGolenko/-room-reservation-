export default class responseWrapper {
  static responseSucces(data) {
    return {
      response: 'ok',
      data: data,
    };
  }

  static responseError(message: string) {
    return {
      response: 'error',
      message,
    };
  }
}
