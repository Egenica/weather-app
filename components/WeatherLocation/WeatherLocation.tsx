import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';

import { Location, getWeatherLocationData } from './../server/weather.location.server';

type WeatherLocationProps = {
  id: string | null;
};

export const WeatherLocation = ({ id }: WeatherLocationProps) => {
  const [locationData, setLocationData] = useState<Location | null>(null);

  useEffect(() => {
    if (id) {
      getWeatherLocationData({ id }).then((data) => {
        if (Array.isArray(data)) {
          console.error('Expected Location object but received array');
        } else {
          setLocationData(data);
        }
      });
    }
  }, [id]);

  if (!locationData) {
    return <div>Loading...</div>;
  }

  console.log('locationData', locationData);

  return (
    <>
      {locationData && (
        <div>
          <Table className="bg-white">
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
              <TableRow>
                {locationData.SiteRep.Wx.Param.map((param, index) => (
                  <TableHead key={index}>{param.$}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationData.SiteRep.DV.Location.Period.map((period, index) => (
                <TableRow key={index}>
                  {period.Rep.map((rep, index) => (
                    <TableCell key={index}>{rep.$}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>

            {/* <TableBody>
              {locationData.SiteRep.DV.Location.Period.map((period, index) =>
                period.Rep.map((rep, repIndex) => (
                  <TableRow key={repIndex}>
                    <TableCell>{rep.$}</TableCell>
                  </TableRow>
                )),
              )}
            </TableBody> */}
          </Table>
        </div>
      )}
    </>
  );
};
