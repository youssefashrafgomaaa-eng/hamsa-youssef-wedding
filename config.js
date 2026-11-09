
window.WEDDING_CONFIG = {
  scriptUrl: 'https://script.google.com/macros/s/AKfycbxwxrnzlpkt5kRllz0ReADvh88p_mIg0CJeDH6cPo6kEt2qxSPYgSM3x5By3d5-zlFvIg/exec',
  venueMapUrl: 'https://www.google.com/maps/place/29%C2%B054%2708.1%22N+31%C2%B012%2720.2%22E/@29.902248,31.2030301,17z/data=!3m1!4b1!4m4!3m3!8m2!3d29.902248!4d31.205605',
  weddingDateTime: '2026-12-04T18:00:00+02:00'
};

document.addEventListener('DOMContentLoaded', function () {
  const mapButton = document.querySelector('.venue-bottom a');
  if (mapButton) {
    mapButton.href = window.WEDDING_CONFIG.venueMapUrl;
  }
});
