import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
      })
    );

    return NextResponse.json({
      items: result.Items ?? [],
    });
  } catch (error) {
    console.error("DynamoDB error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data DynamoDB" },
      { status: 500 }
    );
  }
}