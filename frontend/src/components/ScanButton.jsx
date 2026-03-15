/*
 * Spectre – ScanButton component
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
export default function ScanButton({ scanning, progress, onClick }) {
  return (
    <button
      className={`scan-btn${scanning ? ' scanning' : ''}`}
      onClick={onClick}
      disabled={scanning}
    >
      {scanning ? (
        <>
          <span className="scan-spinner" />
          {progress}%&nbsp;&nbsp;SCANNING
        </>
      ) : (
        <>▶&nbsp;&nbsp;RUN SCAN</>
      )}
    </button>
  );
}
