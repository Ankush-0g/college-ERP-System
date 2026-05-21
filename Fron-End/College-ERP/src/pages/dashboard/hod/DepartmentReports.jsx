import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, CardHeader, Button } from "@material-tailwind/react";
import { getHodReportSummary, exportReport } from "@/API/ApiStore";

export default function DepartmentReports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHodReportSummary();
      setSummary(data);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportReport("department-summary", {});
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "department-summary.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5">Department Reports</Typography>
        <Button color="blue" onClick={handleExport} disabled={exporting || loading}>
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
      <Card>
        <CardHeader shadow={false} floated={false} className="p-4">
          <Typography variant="small" className="text-gray-600">
            Department-level summary and metrics
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          {loading ? (
            <Typography>Loading report...</Typography>
          ) : error ? (
            <Typography color="red">{error}</Typography>
          ) : !summary ? (
            <Typography>No report data available.</Typography>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border p-4">
                <Typography variant="h6">Departments</Typography>
                <Typography className="text-3xl font-bold">{summary.departmentCount}</Typography>
                <Typography className="text-sm text-gray-500">
                  {summary.departmentNames?.join(", ")}
                </Typography>
              </Card>
              <Card className="border p-4">
                <Typography variant="h6">Courses</Typography>
                <Typography className="text-3xl font-bold">{summary.courseCount}</Typography>
              </Card>
              <Card className="border p-4">
                <Typography variant="h6">Subjects</Typography>
                <Typography className="text-3xl font-bold">{summary.subjectCount}</Typography>
              </Card>
              <Card className="border p-4">
                <Typography variant="h6">Professors</Typography>
                <Typography className="text-3xl font-bold">{summary.professorCount}</Typography>
              </Card>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
