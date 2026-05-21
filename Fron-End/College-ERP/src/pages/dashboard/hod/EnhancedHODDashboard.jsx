import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Alert,
} from "@material-tailwind/react";
import { HomeIcon, UsersIcon, AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import DepartmentOverview from "./DepartmentOverview";
import DepartmentProfessors from "./DepartmentProfessors";
import DepartmentStudents from "./DepartmentStudents";
import DepartmentCourses from "./DepartmentCourses";

export function EnhancedHODDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hodInfo, setHodInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedHod = localStorage.getItem("hodData");
    if (storedHod) {
      const hodData = JSON.parse(storedHod);
      setHodInfo(hodData);
    }
  }, []);

  if (!hodInfo) {
    return (
      <Alert color="red" className="m-8">
        Unable to load HOD information. Please log in again.
      </Alert>
    );
  }

  const tabsData = [
    {
      label: "Overview",
      value: "overview",
      icon: HomeIcon,
    },
    {
      label: "Professors",
      value: "professors",
      icon: UsersIcon,
    },
    {
      label: "Students",
      value: "students",
      icon: AcademicCapIcon,
    },
    {
      label: "Courses & Subjects",
      value: "courses",
      icon: BookOpenIcon,
    },
  ];

  return (
    <div className="m-8">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="blue" className="mb-6 p-6">
          <Typography variant="h4" color="white">
            Department Management Portal
          </Typography>
          <Typography variant="small" color="white" className="opacity-80 mt-2">
            {hodInfo.departmentName} Department
            {hodInfo.hodName && ` • ${hodInfo.hodName}`}
          </Typography>
        </CardHeader>

        <CardBody className="px-6 py-8">
          {error && (
            <Alert color="red" className="mb-4">
              {error}
            </Alert>
          )}

          <Tabs value={activeTab} className="w-full">
            <TabsHeader>
              {tabsData.map(({ label, value, icon: Icon }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Tab>
              ))}
            </TabsHeader>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="mt-6">
                <DepartmentOverview hodId={hodInfo.id} />
              </div>
            )}

            {/* Professors Tab */}
            {activeTab === "professors" && (
              <div className="mt-6">
                <DepartmentProfessors hodId={hodInfo.id} />
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div className="mt-6">
                <DepartmentStudents hodId={hodInfo.id} />
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="mt-6">
                <DepartmentCourses hodId={hodInfo.id} />
              </div>
            )}
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}

export default EnhancedHODDashboard;
