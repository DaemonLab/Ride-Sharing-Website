import pool from "../config/db.js";


// request reject krdi toh dobara request bhej skta h
export async function handleUserSentRequest(body) {
    const {
      rideID,
      requestBy
    } = body;
  
    let canMakeRequest = false;
    const queryForReqCheck = `
    SELECT * 
    FROM requests
    WHERE 
    rideID = $1
    requestBy = $2
    `;
    const valuesForReqCheck = [rideID, requestBy];

    const rideDetailsQuery = `
    SELECT createdBy , rideStatus
    FROM rides
    WHERE 
    rideID = $1
    `;
    const valuesForRideDetails = [rideID];

    try {
      const reqCheckResult = await pool.query(queryForReqCheck, valuesForReqCheck);
  
      if (reqCheckResult.rows.length == 0) {
        canMakeRequest = true;
      } else {
        const req_status = reqCheckResult.rows[0].req_status;
  
        if (req_status === "Accepted") return "Accepted";
        else if (req_status === "Pending") return "Pending";
        else canMakeRequest = true;
      }

      if (canMakeRequest) {
        const rideDetails = await pool.query(rideDetailsQuery , valuesForRideDetails);
        const {
            createdBy,
            rideStatus
        } = rideDetails[0];

        const requestEntryQuery = `
        INSERT INTO requests
        (rideID, createdBy , rideStatus , requestBy , requestStatus)
        VALUES 
        ($1 , $2 , $3 , $4 , $5)`;
        const requestEntryValues = [rideID, createdBy, rideStatus, requestBy, "Pending"];
        await pool.query(requestEntryQuery, requestEntryValues);
        return "RequestMade";
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }



// handle request - accept vali upcoming me jyegi and rejected vali udhar hi pdi rhegi
// - rideID , option(accept or reject) , requestBy
export async function handleUserReceivedRequest(body) {
    const {rideID, requestBy, flag} = body;
  
    const query = `
      UPDATE requests
      SET requestStatus = $1,
      WHERE 
      rideID = $2 AND 
      requestBy = $3
      `;
  
    const values = [flag , rideID, requestBy];
  
    try {
        await pool.query(query, values);

        if (flag === "Accepted") {
        const queryForUpdation = `
        UPDATE rides 
        SET seatsAvailable = seatsAvailable - 1
        WHERE 
        rideID = $1
        `;
        const valuesForUpdation = [id];
        await pool.query(queryForUpdation, valuesForUpdation);
      }
  
    } catch (error) {
      throw new Error(error.message);
    }
  }



  // pending requests jo maine dusre ko maari
  // requestBy 
  export async function getSentRequests(body) {
    const { requestBy } = body;
    const query = `
      SELECT *
      FROM requests req
      INNER JOIN rides r ON req."rideID" = r."rideID"
      WHERE rd."requestBy" = $1 
      AND req."requestStatus" = $2
      AND r."rideStatus" = $3 
    `;
    const values = [requestBy, "Pending", "Pending"];
    try {
      const response = await pool.query(query, values);
      return response.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // requests(pending or not) jo dusro ne muje maari
  // createdBy
  export async function getReceivedRequests(body) {
    const { createdBy } = body;
    const query = `
      SELECT *
      FROM requests req
      INNER JOIN rides r ON req."rideID" = r."rideID"
      WHERE req."createdBy" = $1 
      AND req."requestStatus" = $2
      AND r."rideStatus" = $3 
  `;
    const values = [createdBy, "Pending", "Pending"];
    try {
      const response = await pool.query(query, values);
      return response.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  


   