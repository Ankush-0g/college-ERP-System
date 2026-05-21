import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Tooltip,
} from "@material-tailwind/react";
import { HomeIcon, PencilIcon } from "@heroicons/react/24/solid";
import React from "react";
import { ProfileInfoCard } from "@/widgets/cards";
import { getImageUrl } from "@/utils/imageHelper";


export function Profile() {
  const [hod, setHod] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const storedHod = localStorage.getItem("hodData");
    if (!storedHod) {
      setError("HOD details not found in local storage. Please log in again.");
      setLoading(false);
      return;
    }

    let hodData;
    try {
      hodData = JSON.parse(storedHod);
    } catch (e) {
      setError("Invalid stored HOD data. Please log in again.");
      setLoading(false);
      return;
    }

    const hodId = hodData?.id;
    if (!hodId) {
      setError("HOD id is missing. Please log in again.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/api/hod/department/info/${hodId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch HOD info (${res.status})`);
        }
        const data = await res.json();
        setHod(data);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to load HOD information");
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  return (
    <>
      {loading ? (
        <div className="m-8 flex justify-center items-center min-h-[60vh]">
          <Typography variant="h5" color="blue-gray">
            Loading HOD information...
          </Typography>
        </div>
      ) : error ? (
        <div className="m-8">
          <Typography variant="h5" color="red">
            {error}
          </Typography>
        </div>
      ) : (
        <>
          <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/student-background.png')] bg-cover bg-center">
            <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
          </div>
          <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
            <CardBody className="p-4">
              <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-6">
                  <Avatar
                    src={getImageUrl(hod?.imageUrl)}
                    alt={hod?.name || "HOD"}
                    size="xl"
                    variant="rounded"
                    className="rounded-lg shadow-lg shadow-blue-gray-500/40"
                  />
                  <div>
                    <Typography variant="h5" color="blue-gray" className="mb-1">
                      {hod?.name || ""}
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-600"
                    >
                      {hod?.departmentName || ""}
                    </Typography>
                  </div>
                </div>
                <div className="w-96">
                  <Tabs value="info">
                    <TabsHeader>
                      <Tab value="info">
                        <HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                        Info
                      </Tab>
                    </TabsHeader>
                  </Tabs>
                </div>
              </div>
              <div className="grid-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    HOD Details
                  </Typography>
                  <ProfileInfoCard
                    title="Registered HOD"
                    description="Registered HOD personal details"
                    details={{
                      "Full Name": hod?.name,
                      Email: hod?.email,
                      "Phone Number": hod?.phone,
                      "Department Name": hod?.departmentName,
                    }}
                    action={
                      <Tooltip content="Edit Profile">
                        <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                      </Tooltip>
                    }
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}

    </>
  );
}

export default Profile;
